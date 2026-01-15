import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import security from "eslint-plugin-security";
import reactHooks from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**", // Scripts de encriptación tienen excepciones controladas
    ],
  },
  {
    plugins: {
      security,
      "react-hooks": reactHooks,
    },
    rules: {
      // ===== REGLAS DE SEGURIDAD (eslint-plugin-security) =====
      
      // Prevenir detección de expresiones regulares maliciosas (DoS)
      "security/detect-unsafe-regex": "error",
      
      // Detectar uso de Buffer() deprecado (usar Buffer.from())
      "security/detect-buffer-noassert": "error",
      
      // Prevenir eval() y similares (XSS, code injection)
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "warn",
      
      // Detectar require() no literal (potencial code injection)
      "security/detect-non-literal-require": "warn",
      
      // Detectar fs.readFile/writeFile no literal (path traversal)
      "security/detect-non-literal-fs-filename": "warn",
      
      // Detectar RegExp() con input no literal (ReDoS)
      "security/detect-non-literal-regexp": "warn",
      
      // Detectar child_process con input no sanitizado
      "security/detect-child-process": "warn",
      
      // Prevenir pseudoRandomBytes (no es criptográficamente seguro)
      "security/detect-pseudoRandomBytes": "error",
      
      // Detectar posible exposición de información sensible en stack traces
      "security/detect-possible-timing-attacks": "warn",
      
      // Detectar object injection
      "security/detect-object-injection": "off", // Muchos falsos positivos, revisar manualmente
      
      // ===== REGLAS DE REACT HOOKS =====
      "react-hooks/rules-of-hooks": "error", // Verificar reglas de Hooks
      "react-hooks/exhaustive-deps": "warn", // Verificar dependencias de useEffect
      
      // ===== REGLAS GENERALES DE SEGURIDAD =====
      
      // Prevenir console.log en producción (potencial info leak)
      "no-console": ["warn", { allow: ["warn", "error"] }],
      
      // Prevenir debugger en producción
      "no-debugger": "error",
      
      // Prevenir alert/confirm/prompt (mala UX, potencial phishing)
      "no-alert": "warn",
      
      // Prevenir eval() y similares
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      
      // Prevenir with() (scope confusion)
      "no-with": "error",
      
      // Prevenir asignaciones en condicionales (bugs comunes)
      "no-cond-assign": "error",
      
      // Requerir === en lugar de == (prevenir coerción no intencional)
      "eqeqeq": ["error", "always"],
      
      // Prevenir variables no usadas (posible lógica incompleta)
      "no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
    },
  },
  {
    // Configuración específica para archivos de API routes
    files: ["src/app/api/**/*.js"],
    rules: {
      // Más estricto en validación de inputs en APIs
      "security/detect-object-injection": "warn",
      "no-console": "off", // Permitir logs en APIs para debugging
    },
  },
  {
    // Configuración para componentes de pago (extra seguridad)
    files: ["src/components/payment/**/*.jsx", "src/lib/dash/**/*.js"],
    rules: {
      "security/detect-possible-timing-attacks": "error", // Crítico para pagos
      "no-console": ["error", { allow: ["error"] }], // Solo errores
    },
  },
];

export default eslintConfig;
