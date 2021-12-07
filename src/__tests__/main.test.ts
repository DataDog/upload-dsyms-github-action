import {EOL} from 'os'
import * as core from '@actions/core'
import * as action from '../main'

describe('Github Action', () => {
  describe('validate inputs', () => {
    afterEach(() => {
      jest.restoreAllMocks()
      process.env.DATADOG_API_KEY = undefined
      process.env.DATADOG_SITE = undefined
    })

    test('with no api_key parameter', async () => {
      // Given
      const setFailedMock = jest.spyOn(core, 'setFailed')

      // When
      await action.main()

      // Then
      expect(setFailedMock).toHaveBeenCalledWith('Input required and not supplied: api_key')
    })

    test('with no dsym_paths parameter', async () => {
      // Given
      jest.spyOn(core, 'getInput').mockImplementation(() => 'foo')
      const setFailedMock = jest.spyOn(core, 'setFailed')

      // When
      await action.main()

      // Then
      expect(setFailedMock).toHaveBeenCalledWith('Input required and not supplied: dsym_paths')
    })

    test('with eu site', async () => {
      // Given
      jest.spyOn(core, 'getInput').mockImplementation((name) => {
        if (name === 'site') return 'datadoghq.eu'
        if (name === 'api_key') return 'xxx'
        return ''
      })
      jest.spyOn(core, 'getMultilineInput').mockImplementation(() => ['foo', 'bar'])
      jest.spyOn(action, 'upload').mockImplementation(async () => Promise.resolve(0))

      // When
      await action.main()

      // Then
      expect(process.env.DATADOG_SITE).toBe('datadoghq.eu')
    })

    test.each([true, false])('with dry_run: %p', async (dry_run) => {
      // Given
      jest.spyOn(core, 'getInput').mockImplementation((name) => {
        if (name === 'api_key') return 'xxx'
        return ''
      })
      jest.spyOn(core, 'getMultilineInput').mockImplementation(() => ['foo', 'bar'])
      jest.spyOn(core, 'getBooleanInput').mockImplementation(() => dry_run)
      const uploadMock = jest.spyOn(action, 'upload').mockImplementation(async () => Promise.resolve(0))

      // When
      await action.main()

      // Then
      const context = expect.anything()
      expect(uploadMock).toHaveBeenCalledTimes(2)
      expect(uploadMock).toHaveBeenNthCalledWith(1, 'foo', dry_run, context)
      expect(uploadMock).toHaveBeenNthCalledWith(2, 'bar', dry_run, context)
    })
  })

  describe('invoke cli dysms upload', () => {
    beforeEach(() => {
      jest.spyOn(core, 'getInput').mockImplementation(() => 'xxx')
      jest.spyOn(core, 'getMultilineInput').mockImplementation(() => ['foo', 'bar'])
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('dry run', async () => {
      // Given
      jest.spyOn(core, 'getBooleanInput').mockImplementation(() => true)
      const runMock = jest.spyOn(action.cli, 'run').mockImplementation(async () => Promise.resolve(0))

      // When
      await action.main()

      // Then
      const context = expect.anything()
      expect(runMock).toHaveBeenCalledTimes(2)
      expect(runMock).toHaveBeenCalledWith(['dsyms', 'upload', 'foo', '--dry-run'], context)
      expect(runMock).toHaveBeenCalledWith(['dsyms', 'upload', 'bar', '--dry-run'], context)
    })

    test('run', async () => {
      // Given
      jest.spyOn(core, 'getBooleanInput').mockImplementation(() => false)
      const runMock = jest.spyOn(action.cli, 'run').mockImplementation(async () => Promise.resolve(0))

      // When
      await action.main()

      // Then
      const context = expect.anything()
      expect(runMock).toHaveBeenCalledTimes(2)
      expect(runMock).toHaveBeenCalledWith(['dsyms', 'upload', 'foo'], context)
      expect(runMock).toHaveBeenCalledWith(['dsyms', 'upload', 'bar'], context)
    })
  })

  describe('invoke datadog-ci', () => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createMockContext = (): any => {
      let data = ''

      return {
        stdout: {
          toString: () => data,
          write: (input: string) => (data += input),
        },
      }
    }

    test('succeed with folder input', async () => {
      const context = createMockContext()
      const path = 'src/__tests__/fixtures/test'
      const code = await action.upload(path, true, context)
      const stdout = context.stdout.toString()
      const output = stdout.split(EOL)

      expect(stdout).not.toContain('Error')
      expect(code).toBe(0)
      expect(output[1]).toContain('Starting upload with concurrency 20. ')
      expect(output[2]).toContain('Will look for dSYMs in src/__tests__/fixtures/test')
      expect(output[3]).toContain(
        'Uploading dSYM with BD8CE358-D5F3-358B-86DC-CBCF2148097B from src/__tests__/fixtures/test/test.dSYM'
      )
      expect(output[6]).toContain('Handled 1 dSYM with success in')
    })

    test('succeed with zip file input', async () => {
      const context = createMockContext()
      const path = 'src/__tests__/fixtures/test.zip'
      const code = await action.upload(path, true, context)
      const stdout = context.stdout.toString()
      const output = stdout.split(EOL)

      expect(stdout).not.toContain('Error')
      expect(code).toBe(0)
      expect(output[1]).toContain('Starting upload with concurrency 20. ')
      expect(output[2]).toContain('Will look for dSYMs in src/__tests__/fixtures/test.zip')
      expect(output[3]).toContain('Uploading dSYM with BD8CE358-D5F3-358B-86DC-CBCF2148097B from /')
      expect(output[6]).toContain('Handled 1 dSYM with success in')
    })
  })
})
