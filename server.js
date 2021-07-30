const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/', express.static(__dirname + "/"))

app.get('', (req, res) => { res.sendFile(__dirname + '/client.html')})

app.post('/', (req, res) => { 
  const evaluator = JSON.parse(req.body.evaluator)
  const cipherText = parse(req.body.cipherText)

  console.log(evaluator)
  console.log(cipherText)
  
  evaluator.add(cipherText, cipherText, cipherText)
  //res.end(cipherText)
} )

app.listen((3000), ()=>{
  console.log('192.168.0.44:3000 Server Running...')
})

function parse(text) {
  return JSON.parse(text, (_, value) => {
    if (typeof value == 'string') {
      const m = value.match(/"(-?\d+)n"/g);
      if (m && m[0] === value) {
        value = BigInt(m[1])
      }
    }
    return value
  })
}