module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "script", // Permet l'utilisation de require()
  },
  rules: {
    // Autoriser require() dans ce dossier
    "@typescript-eslint/no-require-imports": "off",
    // Autres règles si nécessaire
    "no-console": "off", // Autoriser console.log dans les scripts
  },
};
