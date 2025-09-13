import fs from "fs";
import path from "path";

console.log("🔍 Début de l'analyse des types TypeScript...");

/**
 * Configuration du script
 */
const CONFIG = {
  rootDir: process.cwd(),
  outputDir: path.join(process.cwd(), "docs"),
  outputFile: "types-documentation.md",
  // Extensions de fichiers à analyser
  extensions: [".ts", ".tsx", ".d.ts"],
  // Dossiers à ignorer
  ignoredDirs: [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
    ".nyc_output",
    "logs",
    ".vscode",
    "docs",
  ],
};

/**
 * Vérifie si un répertoire doit être ignoré
 */
function shouldIgnoreDir(dirName) {
  return CONFIG.ignoredDirs.includes(dirName);
}

/**
 * Vérifie si un fichier est un fichier TypeScript
 */
function isTypeScriptFile(fileName) {
  return CONFIG.extensions.some((ext) => fileName.endsWith(ext));
}

/**
 * Extrait les définitions de types d'un fichier
 */
function extractTypes(filePath, content) {
  const types = {
    interfaces: [],
    types: [],
    enums: [],
    classes: [],
    functions: [],
  };

  const lines = content.split("\n");
  const relativePath = path.relative(CONFIG.rootDir, filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;

    // Interfaces
    const interfaceMatch = line.match(/^export\s+interface\s+(\w+)/);
    if (interfaceMatch) {
      const interfaceName = interfaceMatch[1];
      const description = extractDocComment(lines, i);
      types.interfaces.push({
        name: interfaceName,
        line: lineNumber,
        file: relativePath,
        description,
        content: extractBlockContent(lines, i),
      });
    }

    // Types
    const typeMatch = line.match(/^export\s+type\s+(\w+)/);
    if (typeMatch) {
      const typeName = typeMatch[1];
      const description = extractDocComment(lines, i);
      types.types.push({
        name: typeName,
        line: lineNumber,
        file: relativePath,
        description,
        content: line,
      });
    }

    // Enums
    const enumMatch = line.match(/^export\s+enum\s+(\w+)/);
    if (enumMatch) {
      const enumName = enumMatch[1];
      const description = extractDocComment(lines, i);
      types.enums.push({
        name: enumName,
        line: lineNumber,
        file: relativePath,
        description,
        content: extractBlockContent(lines, i),
      });
    }

    // Classes
    const classMatch = line.match(/^export\s+(?:default\s+)?class\s+(\w+)/);
    if (classMatch) {
      const className = classMatch[1];
      const description = extractDocComment(lines, i);
      types.classes.push({
        name: className,
        line: lineNumber,
        file: relativePath,
        description,
        content: line,
      });
    }

    // Functions
    const functionMatch = line.match(/^export\s+(?:async\s+)?function\s+(\w+)/);
    if (functionMatch) {
      const functionName = functionMatch[1];
      const description = extractDocComment(lines, i);
      types.functions.push({
        name: functionName,
        line: lineNumber,
        file: relativePath,
        description,
        content: line,
      });
    }
  }

  return types;
}

/**
 * Extrait les commentaires JSDoc précédant une définition
 */
function extractDocComment(lines, currentIndex) {
  let docComment = "";
  let i = currentIndex - 1;

  // Chercher le commentaire JSDoc ou commentaire simple précédent
  while (i >= 0) {
    const line = lines[i].trim();

    if (line === "" || line.startsWith("//")) {
      i--;
      continue;
    }

    if (line.endsWith("*/")) {
      // Début d'un commentaire JSDoc trouvé
      let commentLines = [];
      let j = i;

      while (j >= 0 && !lines[j].trim().startsWith("/**")) {
        commentLines.unshift(lines[j].trim());
        j--;
      }

      if (j >= 0) {
        commentLines.unshift(lines[j].trim());
        docComment = commentLines
          .join(" ")
          .replace(/\/\*\*|\*\/|\*/g, "")
          .trim();
      }
      break;
    }

    break;
  }

  return docComment;
}

/**
 * Extrait le contenu d'un bloc (interface, enum, etc.)
 */
function extractBlockContent(lines, startIndex) {
  const startLine = lines[startIndex].trim();

  // Si c'est une déclaration sur une ligne
  if (startLine.includes("=") && !startLine.includes("{")) {
    return startLine;
  }

  // Pour les blocs avec accolades
  if (!startLine.includes("{")) {
    return startLine;
  }

  let content = [startLine];
  let braceCount =
    (startLine.match(/\{/g) || []).length -
    (startLine.match(/\}/g) || []).length;

  for (let i = startIndex + 1; i < lines.length && braceCount > 0; i++) {
    const line = lines[i];
    content.push(line);
    braceCount +=
      (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
  }

  return content.join("\n");
}

/**
 * Analyse récursivement tous les fichiers TypeScript
 */
function analyzeDirectory(dirPath) {
  let allTypes = {
    interfaces: [],
    types: [],
    enums: [],
    classes: [],
    functions: [],
  };

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory() && !shouldIgnoreDir(item)) {
        const subTypes = analyzeDirectory(itemPath);

        // Fusionner les résultats
        Object.keys(allTypes).forEach((key) => {
          allTypes[key] = allTypes[key].concat(subTypes[key]);
        });
      } else if (stats.isFile() && isTypeScriptFile(item)) {
        try {
          console.log(
            `📄 Analyse de: ${path.relative(CONFIG.rootDir, itemPath)}`
          );
          const content = fs.readFileSync(itemPath, "utf8");
          const fileTypes = extractTypes(itemPath, content);

          // Fusionner les résultats
          Object.keys(allTypes).forEach((key) => {
            allTypes[key] = allTypes[key].concat(fileTypes[key]);
          });
        } catch (error) {
          console.warn(
            `⚠️ Erreur lors de la lecture de ${itemPath}: ${error.message}`
          );
        }
      }
    }
  } catch (error) {
    console.warn(
      `⚠️ Erreur lors de l'analyse du répertoire ${dirPath}: ${error.message}`
    );
  }

  return allTypes;
}

/**
 * Génère le contenu Markdown
 */
function generateMarkdown(allTypes) {
  const timestamp = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  let content = `# 📋 Documentation des Types TypeScript

> Générée automatiquement le ${timestamp}

## 📊 Statistiques

`;

  // Statistiques globales
  const totalInterfaces = allTypes.interfaces.length;
  const totalTypes = allTypes.types.length;
  const totalEnums = allTypes.enums.length;
  const totalClasses = allTypes.classes.length;
  const totalFunctions = allTypes.functions.length;
  const total =
    totalInterfaces + totalTypes + totalEnums + totalClasses + totalFunctions;

  content += `- **Total**: ${total} définitions
- **Interfaces**: ${totalInterfaces}
- **Types**: ${totalTypes}
- **Énumérations**: ${totalEnums}
- **Classes**: ${totalClasses}
- **Fonctions**: ${totalFunctions}

`;

  // Répartition par fichiers
  const fileStats = {};
  Object.values(allTypes)
    .flat()
    .forEach((item) => {
      fileStats[item.file] = (fileStats[item.file] || 0) + 1;
    });

  content += `### 📁 Répartition par fichiers

| Fichier | Nombre de définitions |
|---------|----------------------|
`;

  Object.entries(fileStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([file, count]) => {
      content += `| \`${file}\` | ${count} |\n`;
    });

  content += `\n---\n\n`;

  // Section Interfaces
  if (allTypes.interfaces.length > 0) {
    content += `## 🏗️ Interfaces (${allTypes.interfaces.length})

`;
    allTypes.interfaces
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => {
        content += `### \`${item.name}\`

- **Fichier**: \`${item.file}:${item.line}\`
- **Description**: ${item.description || "*Aucune description*"}

\`\`\`typescript
${item.content}
\`\`\`

`;
      });
  }

  // Section Types
  if (allTypes.types.length > 0) {
    content += `## 🎯 Types (${allTypes.types.length})

`;
    allTypes.types
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => {
        content += `### \`${item.name}\`

- **Fichier**: \`${item.file}:${item.line}\`
- **Description**: ${item.description || "*Aucune description*"}

\`\`\`typescript
${item.content}
\`\`\`

`;
      });
  }

  // Section Enums
  if (allTypes.enums.length > 0) {
    content += `## 🔢 Énumérations (${allTypes.enums.length})

`;
    allTypes.enums
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => {
        content += `### \`${item.name}\`

- **Fichier**: \`${item.file}:${item.line}\`
- **Description**: ${item.description || "*Aucune description*"}

\`\`\`typescript
${item.content}
\`\`\`

`;
      });
  }

  // Section Classes
  if (allTypes.classes.length > 0) {
    content += `## 🏛️ Classes (${allTypes.classes.length})

`;
    allTypes.classes
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => {
        content += `### \`${item.name}\`

- **Fichier**: \`${item.file}:${item.line}\`
- **Description**: ${item.description || "*Aucune description*"}

\`\`\`typescript
${item.content}
\`\`\`

`;
      });
  }

  // Section Functions
  if (allTypes.functions.length > 0) {
    content += `## ⚡ Fonctions (${allTypes.functions.length})

`;
    allTypes.functions
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => {
        content += `### \`${item.name}\`

- **Fichier**: \`${item.file}:${item.line}\`
- **Description**: ${item.description || "*Aucune description*"}

\`\`\`typescript
${item.content}
\`\`\`

`;
      });
  }

  content += `

---

*Cette documentation a été générée automatiquement. Ne pas modifier manuellement.*
`;

  return content;
}

/**
 * Fonction principale
 */
function main() {
  try {
    console.log("📍 Répertoire de travail:", CONFIG.rootDir);

    // Créer le répertoire docs s'il n'existe pas
    if (!fs.existsSync(CONFIG.outputDir)) {
      console.log("📁 Création du répertoire docs...");
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    console.log("🔍 Analyse des fichiers TypeScript...");
    const allTypes = analyzeDirectory(CONFIG.rootDir);

    console.log("📝 Génération de la documentation...");
    const content = generateMarkdown(allTypes);

    const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
    fs.writeFileSync(outputPath, content, "utf8");

    console.log(`✅ Documentation générée avec succès!`);
    console.log(`📄 ${content.split("\n").length} lignes générées`);
    console.log(`📂 Fichier disponible: ${outputPath}`);

    // Résumé
    const total = Object.values(allTypes).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    console.log(`📋 ${total} définitions analysées:`);
    console.log(`   - ${allTypes.interfaces.length} interfaces`);
    console.log(`   - ${allTypes.types.length} types`);
    console.log(`   - ${allTypes.enums.length} énumérations`);
    console.log(`   - ${allTypes.classes.length} classes`);
    console.log(`   - ${allTypes.functions.length} fonctions`);
  } catch (error) {
    console.error("❌ Erreur lors de la génération:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

// Lancer le script
main();
