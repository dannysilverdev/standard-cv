// Importaciones necesarias
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid'); // Para generar un ID único
const bcrypt = require('bcryptjs'); // Para cifrar contraseñas
const jwt = require('jsonwebtoken'); // Para generar tokens JWT


/************************************************
 *        Crear un nuevo usuario (POST /user)     *
 ************************************************/
// Este endpoint crea un nuevo usuario en la base de datos DynamoDB
module.exports.createUser = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Verificar si el email ya está registrado
    const checkParams = {
      TableName: "StandardCvTableV4",  // Asegúrate de que este sea el nombre de tu tabla
      IndexName: "email-index",        // Suponiendo que has creado un índice en el campo email
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": data.email
      }
    };

    const existingUser = await dynamoDb.query(checkParams).promise();

    // Si ya existe un usuario con el mismo email, devuelve un error
    if (existingUser.Items.length > 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",  // Permitir solicitudes desde cualquier origen
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Métodos permitidos
          "Access-Control-Allow-Headers": "Content-Type, Authorization"  // Encabezados permitidos
        },
        body: JSON.stringify({ message: "Este email ya está registrado." }),
      };
    }

    // Generar un ID único para el usuario
    const userId = uuidv4();  // Genera un ID único
    
    // Cifrar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const params = {
      TableName: "StandardCvTableV4",  // Asegúrate de que este sea el nombre de tu tabla
      Item: {
        PK: `USER#${userId}`,          // Clave primaria (PK) con el ID generado
        SK: 'PERSONAL_INFO',           // Clave secundaria (SK)
        name: data.name,               // Nombre del usuario
        email: data.email,             // Email del usuario
        password: hashedPassword,      // Contraseña cifrada del usuario
        phone: data.phone,             // Teléfono del usuario
        location: data.location,       // Ubicación del usuario
        links: {
          linkedin: data.linkedin      // Agregar el campo linkedin
        }
      }
    };

    // Crear el nuevo usuario si no existe duplicado
    await dynamoDb.put(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",  // Permitir solicitudes desde cualquier origen
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Métodos permitidos
        "Access-Control-Allow-Headers": "Content-Type, Authorization"  // Encabezados permitidos
      },
      body: JSON.stringify({ message: "Usuario creado exitosamente!", item: params.Item }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",  // Permitir solicitudes desde cualquier origen
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Métodos permitidos
        "Access-Control-Allow-Headers": "Content-Type, Authorization"  // Encabezados permitidos
      },
      body: JSON.stringify({ error: "Error al crear el usuario", details: error.message }),
    };
  }
};

/************************************************
 *        Obtener un usuario por ID (GET /user/{id})  *
 ************************************************/
// Este endpoint obtiene la información de un usuario específico por su ID
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
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",  // Permitir solicitudes desde cualquier origen
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Métodos permitidos
          "Access-Control-Allow-Headers": "Content-Type, Authorization"  // Encabezados permitidos
        },
        body: JSON.stringify({ ...result.Item, password: undefined })
      };
    } else {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",  // Permitir solicitudes desde cualquier origen
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Métodos permitidos
          "Access-Control-Allow-Headers": "Content-Type, Authorization"  // Encabezados permitidos
        },
        body: JSON.stringify({ message: 'Usuario no encontrado' })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",  // Permitir solicitudes desde cualquier origen
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Métodos permitidos
        "Access-Control-Allow-Headers": "Content-Type, Authorization"  // Encabezados permitidos
      },
      body: JSON.stringify({ message: 'Error al obtener usuario', error: error.message })
    };
  }
};


// Obtener todos los usuarios (GET /users)
// Este endpoint obtiene la lista de todos los usuarios de la base de datos
module.exports.getAllUsers = async (event) => {
  const params = {
    TableName: "StandardCvTableV4",  // Reemplaza con el nombre correcto de tu tabla
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify(result.Items.map(item => ({ ...item, password: undefined }))),
    };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify({ message: 'Error al obtener usuarios', error: error.message }),
    };
  }
};

// Eliminar un usuario (DELETE /user/{id})
// Este endpoint elimina un usuario específico de la base de datos por su ID
module.exports.deleteUser = async (event) => {
  const userId = event.pathParameters.id;

  // Log para verificar el ID que está llegando desde la solicitud
  console.log("ID recibido para eliminar:", userId);

  // Si el ID no tiene el prefijo "USER#", agrégalo
  const idToDelete = userId.startsWith('USER#') ? userId : `USER#${userId}`;
  console.log("Clave primaria (PK) utilizada para la eliminación:", idToDelete);

  const params = {
    TableName: 'StandardCvTableV4',
    Key: {
      PK: idToDelete,   // Clave primaria (PK)
      SK: 'PERSONAL_INFO',  // Clave de rango (SK), si aplica
    },
  };

  try {
    const result = await dynamoDb.delete(params).promise();
    console.log('Resultado de la eliminación:', result); // Este log mostrará el resultado de la eliminación

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify({ message: 'Usuario eliminado exitosamente' }),
    };
  } catch (error) {
    console.error('Error al eliminar usuario:', error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify({ message: 'Error al eliminar usuario', error: error.message }),
    };
  }
};

// Inicio de sesión de usuario (POST /auth/login)
// Este endpoint permite a los usuarios iniciar sesión y recibir un token JWT
module.exports.login = async (event) => {
  try {
    // Validación del cuerpo de la solicitud
    const data = JSON.parse(event.body || '{}');
    const { email, password } = data;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://unicv.cl",  // Permitir solo este origen
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ message: "Faltan el email o la contraseña." }),
      };
    }

    // Verificar si el usuario existe en DynamoDB
    const params = {
      TableName: "StandardCvTableV4",
      IndexName: "email-index",  // Suponiendo que has creado un índice en el campo email
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    };

    const result = await dynamoDb.query(params).promise();

    if (result.Items.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://unicv.cl",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ message: "Credenciales incorrectas." }),
      };
    }

    const user = result.Items[0];

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://unicv.cl",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ message: "Credenciales incorrectas." }),
      };
    }

    // Generar un token JWT
    const token = jwt.sign({ userId: user.PK }, 'your-secret-key', { expiresIn: '1h' });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://unicv.cl",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ token }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://unicv.cl",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ message: 'Error al iniciar sesión', error: error.message }),
    };
  }
};
