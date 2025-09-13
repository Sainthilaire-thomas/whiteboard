import fs from "fs";
import path from "path";

/**
 * Configuration du script
 */
const CONFIG = {
  // Répertoire racine du projet
  rootDir: process.cwd(),
  // Répertoire de sortie
  outputDir: path.join(process.cwd(), "docs"),
  // Nom du fichier de sortie
  outputFile: "arborescence.md",
  // Fichiers et dossiers à ignorer
  ignoredPatterns: [
    "node_modules",
    ".git",
    ".vscode",
    "dist",
    "build",
    ".next",
    "coverage",
    ".nyc_output",
    "logs",
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.production.local",
    "docs/arborescence.md", // Éviter de s'inclure lui-même
  ],
};

/**
 * Vérifie si un fichier/dossier doit être ignoré
 * @param {string} itemName - Nom du fichier/dossier
 * @param {string} fullPath - Chemin complet
 * @returns {boolean}
 */
function shouldIgnore(itemName, fullPath) {
  return CONFIG.ignoredPatterns.some((pattern) => {
    if (pattern.includes("*")) {
      // Pattern avec wildcard
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));
      return regex.test(itemName);
    } else {
      // Pattern exact
      return itemName === pattern || fullPath.includes(pattern);
    }
  });
}

/**
 * Génère l'arborescence de manière récursive
 * @param {string} dir - Répertoire à analyser
 * @param {string} prefix - Préfixe pour l'affichage
 * @returns {string}
 */
function generateTree(dir, prefix = "") {
  let result = "";

  try {
    const items = fs
      .readdirSync(dir)
      .filter((item) => !shouldIgnore(item, path.join(dir, item)))
      .sort((a, b) => {
        const aPath = path.join(dir, a);
        const bPath = path.join(dir, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();

        // Dossiers en premier, puis fichiers
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });

    items.forEach((item, index) => {
      const itemPath = path.join(dir, item);
      const isLastItem = index === items.length - 1;
      const connector = isLastItem ? "└── " : "├── ";
      const newPrefix = prefix + (isLastItem ? "    " : "│   ");

      try {
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          result += `${prefix}${connector}📁 ${item}/\n`;
          result += generateTree(itemPath, newPrefix);
        } else {
          // Ajouter une icône en fonction de l'extension
          const ext = path.extname(item).toLowerCase();
          let icon = "📄";

          const iconMap = {
            ".js": "📜",
            ".ts": "📘",
            ".jsx": "⚛️",
            ".tsx": "⚛️",
            ".json": "📋",
            ".md": "📝",
            ".txt": "📄",
            ".css": "🎨",
            ".scss": "🎨",
            ".less": "🎨",
            ".html": "🌐",
            ".xml": "🌐",
            ".png": "🖼️",
            ".jpg": "🖼️",
            ".jpeg": "🖼️",
            ".gif": "🖼️",
            ".svg": "🖼️",
            ".pdf": "📕",
            ".zip": "📦",
            ".tar": "📦",
            ".gz": "📦",
            ".yml": "⚙️",
            ".yaml": "⚙️",
            ".toml": "⚙️",
            ".ini": "⚙️",
            ".sh": "⚡",
            ".bat": "⚡",
            ".ps1": "⚡",
            ".py": "🐍",
            ".java": "☕",
            ".cpp": "⚙️",
            ".c": "⚙️",
            ".gitignore": "🚫",
            ".env": "🔒",
          };

          icon = iconMap[ext] || icon;

          // Ajouter la taille du fichier
          const size = formatFileSize(stats.size);
          result += `${prefix}${connector}${icon} ${item} (${size})\n`;
        }
      } catch {
        result += `${prefix}${connector}❌ ${item} (erreur d'accès)\n`;
      }
    });
  } catch {
    result += `${prefix}❌ Erreur lors de la lecture du répertoire\n`;
  }

  return result;
}

/**
 * Formate la taille d'un fichier
 * @param {number} bytes - Taille en bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Génère les statistiques du projet
 * @param {string} dir - Répertoire racine
 * @returns {Object}
 */
function generateStats(dir) {
  const stats = {
    totalFiles: 0,
    totalDirs: 0,
    totalSize: 0,
    fileTypes: {},
    largestFiles: [],
  };

  function traverseDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      items.forEach((item) => {
        const itemPath = path.join(currentDir, item);

        if (shouldIgnore(item, itemPath)) return;

        try {
          const itemStats = fs.statSync(itemPath);

          if (itemStats.isDirectory()) {
            stats.totalDirs++;
            traverseDir(itemPath);
          } else {
            stats.totalFiles++;
            stats.totalSize += itemStats.size;

            const ext = path.extname(item).toLowerCase() || "sans extension";
            stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;

            stats.largestFiles.push({
              name: path.relative(CONFIG.rootDir, itemPath),
              size: itemStats.size,
            });
          }
        } catch {
          // Ignorer les fichiers inaccessibles
        }
      });
    } catch {
      // Ignorer les répertoires inaccessibles
    }
  }

  traverseDir(dir);

  // Garder seulement les 10 plus gros fichiers
  stats.largestFiles.sort((a, b) => b.size - a.size);
  stats.largestFiles = stats.largestFiles.slice(0, 10);

  return stats;
}

/**
 * Génère le contenu Markdown complet
 * @returns {string}
 */
function generateMarkdownContent() {
  const projectName = path.basename(CONFIG.rootDir);
  const timestamp = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  let content = `# 🌳 Arborescence du projet ${projectName}

> Générée automatiquement le ${timestamp}

## 📂 Structure des fichiers

\`\`\`
${projectName}/
${generateTree(CONFIG.rootDir, "")}
\`\`\`

`;

  // Ajouter les statistiques
  const stats = generateStats(CONFIG.rootDir);

  content += `## 📊 Statistiques du projet

- **Fichiers**: ${stats.totalFiles.toLocaleString("fr-FR")}
- **Dossiers**: ${stats.totalDirs.toLocaleString("fr-FR")}
- **Taille totale**: ${formatFileSize(stats.totalSize)}

### Types de fichiers

| Extension | Nombre |
|-----------|--------|
`;

  Object.entries(stats.fileTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      content += `| ${ext} | ${count.toLocaleString("fr-FR")} |\n`;
    });

  if (stats.largestFiles.length > 0) {
    content += `\n### 📦 Fichiers les plus volumineux

| Fichier | Taille |
|---------|--------|
`;

    stats.largestFiles.forEach((file) => {
      content += `| ${file.name} | ${formatFileSize(file.size)} |\n`;
    });
  }

  content += `\n---

*Ce fichier a été généré automatiquement par le script d'arborescence. Ne pas modifier manuellement.*
`;

  return content;
}

/**
 * Fonction principale
 */
function main() {
  console.log("🚀 Début du script de génération...");
  console.log("📍 Répertoire de travail:", process.cwd());

  try {
    console.log("🔍 Vérification du répertoire de sortie...");

    // Créer le répertoire docs s'il n'existe pas
    if (!fs.existsSync(CONFIG.outputDir)) {
      console.log(`📁 Création du répertoire: ${CONFIG.outputDir}`);
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      console.log(`✅ Répertoire créé avec succès`);
    } else {
      console.log(`📁 Répertoire existe déjà: ${CONFIG.outputDir}`);
    }

    console.log("🌳 Génération de l'arborescence...");

    // Générer le contenu
    const content = generateMarkdownContent();
    console.log(`📝 Contenu généré: ${content.length} caractères`);

    // Écrire le fichier
    const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
    console.log(`💾 Écriture dans: ${outputPath}`);

    fs.writeFileSync(outputPath, content, "utf8");

    console.log(`✅ Arborescence générée avec succès!`);
    console.log(`📄 ${content.split("\n").length} lignes générées`);
    console.log(`📂 Fichier disponible: ${outputPath}`);
  } catch (error) {
    console.error("❌ Erreur lors de la génération:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

// Lancer le script immédiatement (sans condition)
main();

export { generateTree, generateStats, main };
