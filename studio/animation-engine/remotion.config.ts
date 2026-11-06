import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');
// Ensure chrome sandbox flags work cleanly in containerized or Linux desktop environments
Config.setChromiumDisableWebSecurity(true);
