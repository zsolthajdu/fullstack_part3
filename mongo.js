const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('Specify password as argument !')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0-cglns.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if( process.argv.length === 3 ) {
  console.log('Phonebook:')
  Person.find( {} ).then(result => {
    result.forEach( person => {
      console.log( person )
    })
    mongoose.connection.close()
  })
}
else if( process.argv.length === 5 ) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(response => {
    console.log(`Added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
    mongoose.connection.close()
  })
}
