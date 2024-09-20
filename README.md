# CRUD API - Full Stack Project

Este proyecto es una API RESTful que permite realizar operaciones **CRUD** (Crear, Leer, Actualizar y Eliminar) sobre una base de datos **DynamoDB**, utilizando **Node.js**, **Express.js** y desplegada en **AWS Lambda** con el **Serverless Framework**.

## Características

- **Tecnologías Utilizadas**:
  - Node.js
  - Express.js
  - DynamoDB (AWS)
  - AWS Lambda
  - Serverless Framework

- **Operaciones CRUD**:
  - **Crear un ítem**: `POST /item`
  - **Leer un ítem**: `GET /item/{id}`
  - **Actualizar un ítem**: `PUT /item/{id}`
  - **Eliminar un ítem (protegido con API Key)**: `DELETE /item/{id}`
  - **Listar todos los ítems**: `GET /items`

## Instalación y Configuración

### Requisitos

1. **Node.js** y **npm** instalados.
2. Tener configurada la **CLI de AWS** con credenciales válidas.
3. **Serverless Framework** instalado globalmente:
```bash
npm install -g serverless
```
   
## Clonar el Repositorio
```bash
git clone git@github.com:dannysilverdev/nodejs-serverless.git
cd nodejs-serverless
```

## Instalar dependencias
```bash
npm install
```
## Configurar DynamoDB

Asegúrate de tener una tabla en DynamoDB llamada MyTable con las siguientes configuraciones:

Partition Key: id (Tipo: String)

## Despliegue
Para desplegar la aplicación en AWS Lambda utilizando Serverless Framework, ejecuta:

serverless deploy
Este comando creará la API en AWS, configurará DynamoDB y desplegará las funciones Lambda.

## Uso

### Crear un Ítem
Método: POST /item
Cuerpo (JSON):
```
{
  "id": "123",
  "message": "Este es un ítem de prueba"
}
```

### Leer un Ítem por ID
Método: GET /item/{id}

### Actualizar un Ítem
Método: PUT /item/{id}
Cuerpo (JSON):
```
{
  "message": "Ítem actualizado"
}
```

### Eliminar un Ítem (protegido con API Key)
Método: DELETE /item/{id}
Encabezado: Incluir el encabezado x-api-key con la API Key generada.
Ejemplo usando cURL:
```
curl -X DELETE https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/item/123 \
-H "x-api-key: YOUR_API_KEY"
```

### Listar todos los Ítems
Método: GET /items
Estructura del Proyecto

```bash
├── handler.js          # Funciones Lambda que manejan el CRUD
├── serverless.yml      # Configuración del Serverless Framework
├── package.json        # Dependencias del proyecto
├── README.md           # Documentación del proyecto
```

## Pruebas
Puedes usar herramientas como Postman o Thunder Client para probar las diferentes rutas del CRUD. Las pruebas incluyen la creación, lectura, actualización, eliminación y listado de ítems.

## Contribuir
Si deseas contribuir a este proyecto, sigue estos pasos:

Haz un fork del repositorio.
Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).
Realiza los cambios necesarios y haz commit (git commit -m 'Agregar nueva funcionalidad').
Empuja los cambios a la rama (git push origin feature/nueva-funcionalidad).
Abre un Pull Request.

## Licencia
Este proyecto está licenciado bajo la MIT License.

### Descripción del contenido:
1. **Descripción del Proyecto**: Explica qué es el proyecto y qué tecnologías utiliza.
2. **Instalación y Configuración**: Instrucciones para instalar dependencias, configurar DynamoDB y desplegar el proyecto.
3. **Uso de la API**: Ejemplos de las rutas CRUD (crear, leer, actualizar, eliminar y listar), con detalles sobre el uso de la API Key en el endpoint DELETE.
4. **Estructura del Proyecto**: Breve descripción de los archivos importantes.
5. **Pruebas**: Sugiere herramientas para realizar pruebas de la API.
6. **Contribuir**: Instrucciones para colaborar en el proyecto.
7. **Licencia**: Indica la licencia del proyecto (MIT License).

Si necesitas más ajustes o personalizaciones, no dudes en decírmelo.
standard-cv
