import { jest } from '@jest/globals';

jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn()
  }
}));
const axios = (await import('axios')).default;
const githubController = (await import('../src/controllers/githubController.js')).default;


function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}


it('doit retourner 400 si pas durl', async () => {
  const req = { body: {}, query: {} };
  const res = mockResponse();

  await githubController.getRepositories(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: 'URL GitHub invalide.' });
})



it('doit retourner 400 si le format URL ne permet pas d\'extraire owner/repo', async () => {
  const req = { body: { url: 'https://github.com/juste-le-nom' }, query: {} };
  const res = mockResponse();

  await githubController.getRepositories(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: "Impossible d'extraire les infos du repo."
  });
});



it('doit retourner les infos du dépôt si tout fonctionne', async () => {
  const req = { body: { url: 'https://github.com/Pierre-Guitard/code_checker' }, query: {} };
  const res = mockResponse();

  axios.get
    .mockResolvedValueOnce({ data: { name: 'code_checker', full_name: 'Pierre-Guitard/code_checker', description: '', language: 'JavaScript' } })
    .mockResolvedValueOnce({ data: [{ author: { login: 'Pierre-Guitard', avatar_url: 'img' }, total: 5 }] })
    .mockResolvedValueOnce({ data: [{}, {}, {}] });

  await githubController.getRepositories(req, res);

  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    name: 'code_checker',
    totalCommits: 5,
    totalFiles: 3
  }));
});


it('doit retourner 500 si une erreur survient lors de la récupération', async () => {
  const req = { body: { url: 'https://github.com/Pierre-Guitard/code_checker' }, query: {} };
  const res = mockResponse();

  axios.get.mockRejectedValue(new Error('Erreur GitHub'));

  await githubController.getRepositories(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Erreur lors de la récupération du dépôt.' });
});
