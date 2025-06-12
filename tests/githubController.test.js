const githubController = require("../src/controllers/githubController");

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); 
  res.json = jest.fn().mockReturnValue(res);
  return res;
}


it ('doit retourner 400 si pas durl', async () => {
    const req = { body: {}, query: {}};
    const res = mockResponse();

    await githubController.getRepositories(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
expect(res.json).toHaveBeenCalledWith({ error: 'URL GitHub invalide.' });
})