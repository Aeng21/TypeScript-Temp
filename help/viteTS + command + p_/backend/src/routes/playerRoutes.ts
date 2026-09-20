import { Router } from 'express';
import PlayerController from '../controllers/playerController.js';

const router = Router();

// File ini bertugas mengecek metode HTTP apa yang dipakai (GET, POST, dll).
router.get('/', PlayerController.getAll);
router.get('/:id', PlayerController.getById);
router.post('/', PlayerController.create);
router.put('/:id', PlayerController.update);
router.delete('/:id', PlayerController.delete);

export default router;