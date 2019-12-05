require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require( 'morgan' )
const cors = require('cors')
const Person = require( './models/person')

app.use(express.static('build'))
app.use(bodyParser.json())
app.use( cors() )

morgan.token( 'postbody', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use( morgan( ':method :url :status :res[content-length] - :response-time ms :postbody') ) 

let persons = [
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]

app.post( '/api/persons', (req, res, next ) => {
  const body = req.body
  if( !body.name || !body.number ) {
    return res.status(400).json({error: 'Missing Field !'  })
  }

  const person = new Person({
    name : body.name,
    number: body.number,
  })
  person.save()
    .then( savedPerson => {
      res.json( savedPerson.toJSON())
    })
    .catch( error => next( error ) )
})

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  Person.countDocuments({}).exec( ( err, count) => {
    const current = new Date()
    res.send(`<p>Phonebook has info for ${ count } people</p><p>${current.toString()}</p>`)
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then( persons => {
    res.json( persons )
  })
})

app.get('/api/persons/:id', (req, res, next ) => {
  Person.findById( req.params.id ).then( person => {
    if( person ) {
      res.json( person.toJSON())
    }
    else {
      res.status( 204 ).end()
    }
  })
  .catch( error => next(error))
})


app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req,res, next ) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
