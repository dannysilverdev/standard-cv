const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Función para crear un ítem
module.exports.createItem = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const params = {
      TableName: "MyTable",
      Item: {
        id: data.id,
        message: data.message
      }
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Ítem creado exitosamente!", item: params.Item }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al crear el ítem", details: error.message }),
    };
  }
};

// Función para obtener un ítem por ID
module.exports.getItem = async (event) => {
  const params = {
    TableName: "MyTable",
    Key: {
      id: event.pathParameters.id,  // Obtenemos el ID desde la URL
    }
  };

  try {
    const result = await dynamoDb.get(params).promise();

    if (result.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Ítem no encontrado" }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al obtener el ítem", details: error.message }),
    };
  }
};
