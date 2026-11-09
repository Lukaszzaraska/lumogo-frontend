const { withPodfile } = require("expo/config-plugins");

const marker = "# Xcode 27 no longer supports deployment targets below iOS 15.";
const deploymentTargetFix = `

    ${marker}
    # Some dependencies still declare older targets in their podspecs.
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_configuration|
        deployment_target = build_configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if deployment_target.nil? || deployment_target.to_f < 15.1
          build_configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        end
      end
    end`;

module.exports = (config) =>
  withPodfile(config, (podfileConfig) => {
    if (podfileConfig.modResults.contents.includes(marker)) {
      return podfileConfig;
    }

    const postInstallEnd = "    )\n  end\nend";
    if (!podfileConfig.modResults.contents.includes(postInstallEnd)) {
      throw new Error("Could not locate the Expo Podfile post_install block.");
    }

    podfileConfig.modResults.contents = podfileConfig.modResults.contents.replace(
      postInstallEnd,
      `    )${deploymentTargetFix}\n  end\nend`,
    );

    return podfileConfig;
  });
