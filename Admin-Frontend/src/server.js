const express = require('express');
const { automateVerification } = require('./verifyDriver'); // Assuming you exported the automation function

const app = express();
const port = 4000;

// Parse JSON request body
app.use(express.json());

// API endpoint to trigger driver verification
app.post('/verify-driver', async (req, res) => {
  const { cnic, licenseNumber } = req.body;

  if (!cnic || !licenseNumber) {
    return res.status(400).send({ message: 'CNIC and License Number are required' });
  }

  try {
    await automateVerification(cnic, licenseNumber); // Call your Puppeteer script
    res.status(200).send({ message: 'Driver verification started. Please complete the CAPTCHA manually.' });
  } catch (error) {
    res.status(500).send({ message: 'Verification failed. Please try again.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
