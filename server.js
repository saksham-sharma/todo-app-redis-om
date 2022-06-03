const { Entity, Client, Schema } = require('redis-om');
const express = require('express');
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
const port = process.env.PORT || 5000;

class Todo extends Entity { }

const todoSchema = new Schema(Todo, {
  title: { type: 'string' },
  completed: { type: 'boolean' }
});

app.listen(port, () => console.log(`Listening on port ${port}`));

const client = new Client();

app.put('/api/todos', async (req, res) => {
  await client.open('redis://default:dLZJrdpNPK1AoM04f0KQTwKyQ1qgs7vh/redis-13513.c16.us-east-1-3.ec2.cloud.redislabs.com:13513');
  const todoRepository = client.fetchRepository(todoSchema);
  const todo = await todoRepository.createAndSave(req.body);
  await client.close();
  res.status(201).json(todo)
});

app.delete('/api/todos/:id', async (req, res) => {
  await client.open('redis://default:dLZJrdpNPK1AoM04f0KQTwKyQ1qgs7vh/redis-13513.c16.us-east-1-3.ec2.cloud.redislabs.com:13513');
  const todoRepository = client.fetchRepository(todoSchema);
  await todoRepository.remove(req.params.id);
  res.status(204).send({ entityId: req.params.id });
});

app.post('/api/todos/:id', async (req, res) => {
  await client.open('redis://default:dLZJrdpNPK1AoM04f0KQTwKyQ1qgs7vh/redis-13513.c16.us-east-1-3.ec2.cloud.redislabs.com:13513');
  const todoRepository = client.fetchRepository(todoSchema);
  const todo = await todoRepository.fetch(req.params.id);
  todo.title = req.body.title ?? null;
  todo.completed = req.body.completed ?? null;
  await todoRepository.save(todo);
  res.status(200).send(todo);
});

app.get('/api/todos', async (req, res) => {
  console.log("get todos!");
  await client.open('redis://default:dLZJrdpNPK1AoM04f0KQTwKyQ1qgs7vh/redis-13513.c16.us-east-1-3.ec2.cloud.redislabs.com:13513');
  const todoRepository = client.fetchRepository(todoSchema);
  await todoRepository.createIndex();
  let todos;
  if (req.body.completed) {
    todos = await todoRepository.search().where('completed').is.true().return.all();
  } else if (req.body.active) {
    todos = await todoRepository.search().where('completed').is.false().return.all();
  } else {
    todos = await todoRepository.search().return.all();
  }
  res.status(200).send(todos);
});
