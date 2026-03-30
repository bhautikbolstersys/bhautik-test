require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
}

main()
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log(err));

app.listen(port, () => {
    console.log(`Start server at http://localhost:${port}`);
});