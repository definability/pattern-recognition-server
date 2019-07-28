const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const staticPath = path.join(__dirname, '..', '..', 'dist');

app.use(express.static(staticPath));
app.get('*', (req, res) => {
   res.sendFile(path.join(staticPath, 'index.html'));
});
app.listen(port, () => {
  console.log(`Pattern recognition server is listening on port ${port}`);
});
