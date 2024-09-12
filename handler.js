const AWS = require('aws-sdk');
const express = require('express');
const serverless = require('serverless-http');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const app = express();
app.use(express.json());

const TABLE_NAME = 'MyTable';  // Mantén el nombre de la tabla

// Ruta para crear un ítem (POST /item)
app.post('/item', async (req, res) => {
  const { id, message } = req.body;
  const params = {
    TableName: TABLE_NAME,
    Item: {
      id,
      message
    }
  };

  try {
    await dynamoDb.put(params).promise();
    res.status(200).json({ message: 'Ítem creado exitosamente!', item: params.Item });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el ítem', details: error.message });
  }
});

// Ruta para obtener un ítem por ID (GET /item/:id)
app.get('/item/:id', async (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  try {
    const result = await dynamoDb.get(params).promise();
    if (result.Item) {
      res.status(200).json(result.Item);
    } else {
      res.status(404).json({ error: 'Ítem no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el ítem', details: error.message });
  }
});

// Agregar más rutas si es necesario...

// Exportar la aplicación Express como una función Lambda
module.exports.handler = serverless(app);
