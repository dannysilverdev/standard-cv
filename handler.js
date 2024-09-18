const AWS = require('aws-sdk');
const express = require('express');
const serverless = require('serverless-http');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const app = express();
app.use(express.json());

const TABLE_NAME = 'MyTable';  // Mantener el nombre de la tabla

// Crear un ítem (POST /item)
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

// Obtener un ítem por ID (GET /item/:id)
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

// Actualizar un ítem (PUT /item/:id)
app.put('/item/:id', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set message = :message',
    ExpressionAttributeValues: {
      ':message': message,
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    const result = await dynamoDb.update(params).promise();
    res.status(200).json({ message: 'Ítem actualizado!', result });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el ítem', details: error.message });
  }
});

// Eliminar un ítem (DELETE /item/:id)
app.delete('/item/:id', async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  try {
    await dynamoDb.delete(params).promise();
    res.status(200).json({ message: `Ítem con id ${id} eliminado!` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el ítem', details: error.message });
  }
});

// Obtener todos los ítems (GET /items)
app.get('/items', async (req, res) => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    res.status(200).json(result.Items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ítems', details: error.message });
  }
});

module.exports.handler = serverless(app);
