# ArchMind - Análisis Inteligente de Arquitectura de Proyectos

Plataforma full-stack para análisis automático y enriquecimiento con IA de proyectos de software. ArchMind proporciona mapeo completo de arquitectura, documentación inteligente y reportes profundos de estructura de código.

## Descripción General

ArchMind resuelve el problema fundamental en la industria: la comprensión y documentación de proyectos complejos. Automatiza lo que previamente requería horas de análisis manual:

- Análisis automático de arquitectura y dependencias
- Generación inteligente de documentación con IA
- Exportación de reportes en PDF profesionales
- Re-análisis en tiempo real de proyectos actualizados
- Gestión centralizada de patrones arquitectónicos

### Problema Resuelto

Los equipos de desarrollo enfrentan constantemente estos desafíos:

1. Documentación desactualizada que no refleja la arquitectura actual
2. Onboarding lento por falta de comprensión clara de la estructura del proyecto
3. Análisis inconsistentes de arquitectura sin estándares claros
4. Auditorías técnicas que requieren semanas de investigación manual
5. Pérdida de contexto histórico de decisiones arquitectónicas

ArchMind automatiza estos procesos, permitiendo que los equipos se enfoquen en innovación.

## Tecnologías y Motores

### Stack Backend

TypeScript 7.0 con Express 5.2 como framework web principal. MongoDB 9.7 a través de Mongoose ODM proporciona persistencia de datos. El sistema utiliza Pino para logging de alto rendimiento y Multer para gestión de cargas de archivos.

#### Motores Especializados

**Motor de Análisis**: Implementado en `src/modules/analysis/engine/`, utiliza Puppeteer 25.3 para análisis profundo de estructura de proyectos, mapeo de dependencias y detección de patrones arquitectónicos.

**Motor de IA**: Ubicado en `src/modules/ai/engine/AIClient.ts`, integra modelos de lenguaje para generación de análisis inteligentes, documentación contextual y recomendaciones de mejora.

**Motor de PDF**: En `src/modules/pdf/engine/`, genera reportes profesionales combinando análisis con diseño responsable mediante Puppeteer e integración con adm-zip para manejo de archivos comprimidos.

**Motor de Documentación**: Procesa análisis complejos y los transforma en documentación markdown/HTML estructurada, manteniendo contexto y referencias cruzadas.

### Stack Frontend

React 19.2 con TypeScript 6.0, Vite 8.1 como bundler ultrarrápido. React Router 7.18 proporciona enrutamiento de aplicación de página única. Tailwind CSS 4.3 ofrece utilitarios de diseño responsivo, con React Markdown para renderizado de contenido dinámico.

### Dependencias Auxiliares

- adm-zip 0.6: Manipulación de archivos ZIP para procesamiento de proyectos
- CORS 2.8: Control de acceso cross-origin
- dotenv 17.4: Gestión segura de variables de entorno
- Lucide React 1.25: Iconografía consistente en UI

## Arquitectura

### Estructura del Proyecto

```
ArchMind/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── app.ts              (Configuración Express)
│   │   │   │   └── server.ts           (Punto de entrada)
│   │   │   ├── config/
│   │   │   │   └── env.ts              (Variables de entorno)
│   │   │   ├── database/
│   │   │   │   └── index.ts            (Conexión MongoDB)
│   │   │   ├── shared/
│   │   │   │   ├── logger/             (Sistema Pino)
│   │   │   │   └── middleware/         (Upload, CORS, etc)
│   │   │   ├── modules/
│   │   │   │   ├── projects/           (Gestión de proyectos)
│   │   │   │   ├── analysis/           (Motor de análisis)
│   │   │   │   ├── ai/                 (Enriquecimiento IA)
│   │   │   │   ├── documentation/      (Generación de docs)
│   │   │   │   ├── pdf/                (Exportación PDF)
│   │   │   │   └── knowledge/          (Base de conocimiento)
│   │   │   │   └── [module]/
│   │   │   │       ├── domain/         (Entidades y lógica)
│   │   │   │       ├── engine/         (Algoritmos)
│   │   │   │       ├── infrastructure/ (Data Access)
│   │   │   │       └── presentation/   (Controllers & Routes)
│   │   │   └── routes/
│   │   │       └── index.ts            (Router principal)
│   │   └── uploads/                    (Almacenamiento temporal)
│   │
│   └── web/
│       ├── src/
│       │   ├── components/             (Componentes reutilizables)
│       │   ├── pages/                  (Dashboard, Upload, Detail, AI)
│       │   ├── api/                    (Cliente HTTP)
│       │   ├── hooks/                  (Custom React hooks)
│       │   ├── types/                  (Interfaces TypeScript)
│       │   ├── config/                 (Configuración)
│       │   ├── App.tsx                 (Raíz de componentes)
│       │   └── main.tsx                (Punto de entrada)
│       └── public/                     (Assets estáticos)
│
└── README.md
```

### Patrón Arquitectónico

Cada módulo sigue arquitectura limpia en capas:

- **Presentation**: Controllers y rutas HTTP que manejan solicitudes
- **Application/Domain**: Lógica de negocio pura, independiente de frameworks
- **Engine**: Motores especializados para análisis, IA y procesamiento
- **Infrastructure**: Acceso a datos, persistencia y servicios externos
- **Shared**: Utilidades comunes, logging y middlewares

### Flujo de Datos

1. Upload de ZIP → Extracción y almacenamiento
2. Análisis automático → Mapeo de estructura y dependencias
3. Enriquecimiento IA → Generación de insights inteligentes
4. Documentación generada → Markdown y PDF exportables
5. Base de conocimiento → Almacenamiento para futuras referencias

## Endpoints de la API

Base URL: `http://localhost:3000/api`

### Health Check

GET `/health` - Verifica disponibilidad del servidor

### Projects

GET `/projects/gettingAllData` - Obtiene todos los proyectos registrados

GET `/projects/:projectId` - Obtiene detalles de un proyecto específico

POST `/projects/file/name` - Crea nuevo proyecto con nombre

POST `/projects/upload/project/zip` - Carga y procesa archivo ZIP del proyecto

### Analysis

GET `/analysis/:projectId` - Obtiene análisis existente del proyecto

POST `/analysis/:projectId/reanalyze` - Ejecuta nuevo análisis (útil después de actualizaciones)

### AI Enrichment

GET `/ai/:projectId` - Obtiene análisis enriquecidos con IA

### Documentation

GET `/documentation/:projectId` - Obtiene documentación generada

### PDF Export

POST `/pdf/:projectId` - Genera PDF completo del análisis

POST `/pdf/from-markdown/raw` - Convierte markdown directo a PDF

### Knowledge Base

GET `/knowledge` - Obtiene patrones y arquitecturas almacenadas

## Instalación

### Requisitos

Node.js 18+, MongoDB 5.0+

### Configuración Inicial

1. Clonar repositorio:
```bash
git clone https://github.com/yaarielre/ArchMind.git
cd ArchMind
```

2. Variables de entorno - Crear `.env` en `apps/api/`:
```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/archmind
CORS_ORIGINS=http://localhost:5173
```

3. Instalar dependencias:
```bash
cd apps/api && npm install
cd ../web && npm install
```

4. Iniciar servicios:
```bash
# Terminal 1: Backend
cd apps/api
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev
```

Accede a http://localhost:5173

## Resolución de Problemas Comunes

**MongoDB no conecta**: Verifica que MongoDB esté ejecutándose localmente o configura MONGO_URI con una conexión Atlas.

**CORS error**: Asegúrate de agregar la URL del frontend en `CORS_ORIGINS` en `.env`.

**Upload lento**: Para archivos grandes, aumenta los timeouts en Express y verifica la velocidad de red.

**Análisis sin resultados**: Verifica que las claves de API externa estén configuradas correctamente en variables de entorno.

**Memory overflow**: Incrementa memoria disponible con `NODE_OPTIONS=--max-old-space-size=4096`
AI-powered platform that analyzes source code and generates professional technical documentation with architecture insights and PDF export.
