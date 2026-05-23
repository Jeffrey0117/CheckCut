/**
 * Admin Persons Routes
 * CRUD operations for person management (requires auth)
 */

import { Router } from 'express'
import { getPersons, getPersonById, createPerson, updatePerson, deletePerson } from '../services/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// GET / — list all persons
router.get('/', (req, res) => {
  try {
    const persons = getPersons()
    res.json({ success: true, data: persons })
  } catch (error) {
    console.error('[ADMIN-PERSONS]', error.message)
    res.status(500).json({ error: 'Failed to fetch persons' })
  }
})

// GET /:id — single person by ID
router.get('/:id', (req, res) => {
  try {
    const person = getPersonById(req.params.id)
    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }
    res.json({ success: true, data: person })
  } catch (error) {
    console.error('[ADMIN-PERSON]', error.message)
    res.status(500).json({ error: 'Failed to fetch person' })
  }
})

// POST / — create person
router.post('/', (req, res) => {
  try {
    const { name, avatar, bio, seedblog_author_id } = req.body

    if (!name) {
      return res.status(400).json({ error: 'name is required' })
    }

    const person = createPerson({ name, avatar, bio, seedblog_author_id })
    res.status(201).json({ success: true, data: person })
  } catch (error) {
    console.error('[ADMIN-PERSON CREATE]', error.message)
    res.status(500).json({ error: 'Failed to create person' })
  }
})

// PUT /:id — update person
router.put('/:id', (req, res) => {
  try {
    const person = updatePerson(req.params.id, req.body)
    res.json({ success: true, data: person })
  } catch (error) {
    if (error.message === 'Person not found') {
      return res.status(404).json({ error: error.message })
    }
    console.error('[ADMIN-PERSON UPDATE]', error.message)
    res.status(500).json({ error: 'Failed to update person' })
  }
})

// DELETE /:id — delete person
router.delete('/:id', (req, res) => {
  try {
    deletePerson(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error('[ADMIN-PERSON DELETE]', error.message)
    res.status(500).json({ error: 'Failed to delete person' })
  }
})

export default router
