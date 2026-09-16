import { describe, expect, it } from 'vitest'
import { getAvailableLessons, getLessonTitle, lessonLabel, parseLessonLevel } from './listeningSession'
import type { SpeakMetadata, SpeakSentenceManifestEntry } from '../types/speak'

describe('parseLessonLevel', () => {
  it('parses a CEFR id with a sequence number', () => {
    expect(parseLessonLevel('lesson_B1.1')).toEqual({ level: 'B', sublevel: 1, sequence: 1, subsequence: 0 })
  })

  it('parses a CEFR id with a multi-digit sequence number', () => {
    expect(parseLessonLevel('lesson_A1.10')).toEqual({ level: 'A', sublevel: 1, sequence: 10, subsequence: 0 })
  })

  it('parses a CEFR id without a sequence number', () => {
    expect(parseLessonLevel('lesson_B2')).toEqual({ level: 'B', sublevel: 2, sequence: 0, subsequence: 0 })
  })

  it('parses a CEFR id with a sub-lesson number', () => {
    expect(parseLessonLevel('lesson_A1.1.1')).toEqual({ level: 'A', sublevel: 1, sequence: 1, subsequence: 1 })
  })

  it('parses a CEFR id with multi-digit sequence and sub-lesson numbers', () => {
    expect(parseLessonLevel('lesson_A1.10.2')).toEqual({ level: 'A', sublevel: 1, sequence: 10, subsequence: 2 })
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

  it('renders a CEFR id with a sub-lesson number as "Lesson <level><sublevel>.<sequence>.<subsequence>"', () => {
    expect(lessonLabel('lesson_A1.1.1', 'Lesson')).toBe('Lesson A1.1.1')
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

  it('sorts sub-lessons between their parent lesson and the next sequence number', () => {
    const manifest = manifestFor(['lesson_A1.2', 'lesson_A1.1.2', 'lesson_A1.1', 'lesson_A1.1.1'])
    expect(getAvailableLessons(manifest)).toEqual(['lesson_A1.1', 'lesson_A1.1.1', 'lesson_A1.1.2', 'lesson_A1.2'])
  })
})

describe('getLessonTitle', () => {
  const metadata: SpeakMetadata = {
    lesson_with_title: {
      level: 1,
      title: { pl: 'Czasownik jestem (stan) - ser' },
      parts: { ser: { es: [['soy', 3]] } },
    },
    lesson_without_title: {
      level: 1,
      parts: { cuando: { es: [['¿Cuándo?', 3]] } },
    },
  }

  it('returns the title for the native language when present', () => {
    expect(getLessonTitle(metadata, 'lesson_with_title', 'pl')).toBe('Czasownik jestem (stan) - ser')
  })

  it('falls back to the first parts key when the title object has no entry for the native language', () => {
    expect(getLessonTitle(metadata, 'lesson_with_title', 'en')).toBe('ser')
  })

  it('falls back to the first parts key when the lesson has no title at all', () => {
    expect(getLessonTitle(metadata, 'lesson_without_title', 'pl')).toBe('cuando')
  })

  it('returns null when the lesson is not in metadata', () => {
    expect(getLessonTitle(metadata, 'lesson_missing', 'pl')).toBeNull()
  })

  it('returns null when metadata itself is null', () => {
    expect(getLessonTitle(null, 'lesson_with_title', 'pl')).toBeNull()
  })
})
