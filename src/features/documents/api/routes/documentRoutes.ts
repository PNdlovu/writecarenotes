import { Router } from 'express';
import { documentHandlers } from '../handlers/documentHandlers';

const router = Router();

router.post('/', async (req, res) => {
  const { title, content, metadata } = req.body;
  const document = await documentHandlers.createDocument(title, content, metadata);
  res.json(document);
});

router.get('/:id', async (req, res) => {
  const document = await documentHandlers.getDocument(req.params.id);
  res.json(document);
});

router.put('/:id', async (req, res) => {
  const document = await documentHandlers.updateDocument(req.params.id, req.body);
  res.json(document);
});

router.delete('/:id', async (req, res) => {
  await documentHandlers.deleteDocument(req.params.id);
  res.status(204).send();
});

router.get('/', async (req, res) => {
  const documents = await documentHandlers.searchDocuments(req.query);
  res.json(documents);
});

export const documentRoutes = router;


