export const getIndexMessage = async (req, res) => {
  try {
    let reqVar = req;
    res.json('hello this is the backend');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
87;
