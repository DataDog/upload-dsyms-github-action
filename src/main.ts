import {platform} from 'os'
import * as core from '@actions/core'
import {BaseContext, Cli} from 'clipanion'
import {DsymsUploadCommand} from '@datadog/datadog-ci-base/commands/dsyms/upload'

// Create a local clipanion cli and register the dsyms DsymsUploadCommand.
export const cli = new Cli()
cli.register(DsymsUploadCommand)

/**
 * Uploads Dsym files at the given path.
 *
 * @param path The path to the dsym files
 * @param dry_run If set to `true`, it will run the command without the
 *                final step of upload. All other checks are performed.
 * @param context The cli command context.
 * @returns 0 for success, 1 for failure.
 */
export const upload = async (path: string, dry_run: boolean, context: BaseContext): Promise<number> => {
  const cmd = ['dsyms', 'upload', path]
  if (dry_run) cmd.push('--dry-run')
  return cli.run(cmd, context)
}

export const main = async (): Promise<void> => {
  try {
    if (platform() !== 'darwin') {
      throw new Error('This Action runs on macOS only.')
    }

    process.env.DATADOG_API_KEY = core.getInput('api_key', {required: true})
    process.env.DATADOG_SITE = core.getInput('site')

    const context: BaseContext = {
      stdin: process.stdin,
      stdout: process.stdout,
      stderr: process.stderr,
      env: process.env,
      colorDepth: 1,
    }

    const paths = core.getMultilineInput('dsym_paths', {required: true})
    // https://github.com/actions/toolkit/issues/844
    // Can't use core.getBooleanInput() because it breaks when input is not set.
    const dry_run = core.getInput('dry_run', {required: false}).toLowerCase() === 'true'

    for (const path of paths) {
      await upload(path, dry_run, context)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

if (require.main === module) {
  main()
}
