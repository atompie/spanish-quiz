import { describe, expect, it } from 'vitest'
import { getAvailableLessons, lessonLabel, parseLessonLevel } from './listeningSession'
import type { SpeakSentenceManifestEntry } from '../types/speak'

describe('parseLessonLevel', () => {
  it('parses a CEFR id with a sequence number', () => {
    expect(parseLessonLevel('lesson_B1.1')).toEqual({ level: 'B', sublevel: 1, sequence: 1 })
  })

  it('parses a CEFR id with a multi-digit sequence number', () => {
    expect(parseLessonLevel('lesson_A1.10')).toEqual({ level: 'A', sublevel: 1, sequence: 10 })
  })

  it('parses a CEFR id without a sequence number', () => {
    expect(parseLessonLevel('lesson_B2')).toEqual({ level: 'B', sublevel: 2, sequence: 0 })
  })

  it('returns null for a legacy purely-numeric id', () => {
    expect(parseLessonLevel('lesson_1')).toBeNull()
  })

  it('returns null for an unrecognized id', () => {
    expect(parseLessonLevel('lesson_foo')).toBeNull()
  })
})

describe('lessonLabel', () => {
  it('renders a CEFR id with a sequence number as "Lesson <level><sublevel>.<sequence>"', () => {
    expect(lessonLabel('lesson_B1.1', 'Lesson')).toBe('Lesson B1.1')
  })

  it('renders another CEFR id correctly', () => {
    expect(lessonLabel('lesson_A1.1', 'Lesson')).toBe('Lesson A1.1')
  })

  it('renders a legacy purely-numeric id as "Lesson <N>"', () => {
    expect(lessonLabel('lesson_5', 'Lesson')).toBe('Lesson 5')
  })

  it('falls back to the raw id when unrecognized', () => {
    expect(lessonLabel('mystery_lesson', 'Lesson')).toBe('mystery_lesson')
  })
})

describe('getAvailableLessons', () => {
  function manifestFor(lessons: string[]): SpeakSentenceManifestEntry[] {
    return lessons.map((lesson) => ({ slug: 'part_1', lesson, counts: { es: 1 } }))
  }

  it('sorts multi-digit sequence numbers numerically, not lexicographically', () => {
    const manifest = manifestFor(['lesson_A1.10', 'lesson_A1.2'])
    expect(getAvailableLessons(manifest)).toEqual(['lesson_A1.2', 'lesson_A1.10'])
  })

  it('sorts CEFR levels in progression order', () => {
    const manifest = manifestFor(['lesson_B1.1', 'lesson_A2.1', 'lesson_A1.1'])
    expect(getAvailableLessons(manifest)).toEqual(['lesson_A1.1', 'lesson_A2.1', 'lesson_B1.1'])
  })

  it('sorts legacy numeric ids before CEFR-shaped ids', () => {
    const manifest = manifestFor(['lesson_A1.1', 'lesson_2'])
    expect(getAvailableLessons(manifest)).toEqual(['lesson_2', 'lesson_A1.1'])
  })
})
