/**
 * Persons Routes
 * Public person listing and detail endpoints
 */

import { Router } from 'express'
import { getPersons, getPersonBySlug, getVideosByPerson } from '../services/database.js'
import { toPublicVideo } from '../helpers/video.js'

const router = Router()

// GET / — list all persons
router.get('/', (req, res) => {
  try {
    const persons = getPersons()
    res.json({ success: true, data: persons })
  } catch (error) {
    console.error('[PERSONS]', error.message)
    res.status(500).json({ error: 'Failed to fetch persons' })
  }
})

// GET /:slug — person detail + their videos
router.get('/:slug', (req, res) => {
  try {
    const person = getPersonBySlug(req.params.slug)
    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    const videos = getVideosByPerson(person.id)

    res.json({
      success: true,
      data: {
        ...person,
        videos: videos.map(toPublicVideo),
      },
    })
  } catch (error) {
    console.error('[PERSON]', error.message)
    res.status(500).json({ error: 'Failed to fetch person' })
  }
})

export default router
