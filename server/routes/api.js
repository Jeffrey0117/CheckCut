/**
 * API Route Aggregator
 * Mounts all sub-routes under /api/v1
 */

import { Router } from 'express'
import videosRoutes from './videos.js'
import personsRoutes from './persons.js'
import browseRoutes from './browse.js'
import adminVideosRoutes from './admin-videos.js'
import adminPersonsRoutes from './admin-persons.js'
import streamRoutes from './stream.js'
import seedblogRoutes from './seedblog.js'

const router = Router()

router.use('/videos', videosRoutes)
router.use('/persons', personsRoutes)
router.use('/stream', streamRoutes)
router.use('/seedblog', seedblogRoutes)
router.use('/', browseRoutes)
router.use('/admin/videos', adminVideosRoutes)
router.use('/admin/persons', adminPersonsRoutes)

export default router
