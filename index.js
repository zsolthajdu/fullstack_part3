const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require( 'morgan' )

app.use(bodyParser.json())
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

const generateId = () => {
  return Math.round( Math.random() * 2000000000 )
}

app.post( '/api/persons', (req, res ) => {
  const body = req.body
  if( !body.name || !body.number ) {
    return res.status(400).json({error: 'Missing Field !'  })
  }

  p = persons.find( person => person.name===body.name )
  if( p ) {
    return res.status(400).json({error: 'Person already exists !'  })
  }

  const person = {
    name : body.name,
    number: body.number,
    id: generateId(),
  }
  persons = persons.concat( person)

  res.json(person)
})

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  const current = new Date()
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${current.toString()}</p>`)
  
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number( req.params.id )
  const person = persons.find( person => person.id ===id)
  if( person )
    res.json(person)
  else
    res.status(404).end()
})

app.delete('/api/persons/:id', (req,resp) => {
  const id = Number( req.params.id )
  persons = persons.filter( person => person.id !== id )
  resp.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
