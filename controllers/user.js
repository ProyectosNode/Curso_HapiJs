'use strict'

// const Boom = require('@hapi/boom')
const users = require('../models/index').users

async function createUser (req, h) {
  let result
  try {
    result = await users.create(req.payload)
  } catch (error) {
    console.error(error)
    return h.view('register', {
      title: 'Registro',
      error: 'Error Creando el Usuario'
    })
    // return h.response('Problemas creando el usuario').code(500)
  }
  return h.view('register', {
    title: 'Registro',
    success: 'Usuario Creado Exitosamente'
  })
  // return h.response(`Usuario creado ID: ${result}`)
}

function logout (req, h) {
  return h.redirect('/login').unstate('user')
}

async function validateUser (req, h) {
  let result
  try {
    result = await users.validateUser(req.payload)
    if (!result) {
      return h.view('login', {
        title: 'Login',
        error: 'Email y/o contrasena incorrecta'
      })
      // return h.response('Email y/o contrasena incorrecta').code(401)
    }
  } catch (error) {
    console.error(error)
    // return h.response('Problemas validando el usuario').code(500)
    return h.view('login', {
      title: 'Login',
      error: 'Problemas validando el usuario'
    })
  }

  return h.redirect('/').state('user', {
    name: result.name,
    email: result.email
  })
}

function failValidation (req, h, err) {
  const templates = {
    '/create-user': 'register',
    '/validate-user': 'login',
    '/create-question': 'ask'
  }

  return h.view(templates[req.path], {
    title: 'Error de validacion',
    error: 'Por favor complete los campos requeridos'
  }).code(400).takeover()
  // return Boom.badRequest('Fallo la validacion', req.payload)
}

module.exports = {
  createUser: createUser,
  failValidation: failValidation,
  logout: logout,
  validateUser: validateUser
}
