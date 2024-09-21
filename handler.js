const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Crear un nuevo usuario (POST /user)
module.exports.createUser = async (event) => {
  const { id, name, email, phone, location, links } = JSON.parse(event.body);

  const params = {
    TableName: "StandardCvTableV4",
    Item: {
      PK: `USER#${id}`,   // Partition Key
      SK: 'PERSONAL_INFO', // Sort Key para almacenar información del usuario
      name: name,
      email: email,
      phone: phone,
      location: location,
      links: links
    }
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Usuario creado exitosamente', user: params.Item }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al crear usuario', error: error.message }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
};

// Obtener un usuario por ID (GET /user/{id})
module.exports.getUser = async (event) => {
  const { id } = event.pathParameters;

  const params = {
    TableName: "StandardCvTableV4",
    Key: {
      PK: `USER#${id}`,  // Partition Key
      SK: 'PERSONAL_INFO' // Sort Key
    }
  };

  try {
    const result = await dynamoDb.get(params).promise();
    if (result.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
        headers: {
          "Content-Type": "application/json"
        }
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Usuario no encontrado' }),
        headers: {
          "Content-Type": "application/json"
        }
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener usuario', error: error.message }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
};
