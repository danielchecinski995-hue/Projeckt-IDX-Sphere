{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.jdk17
    pkgs.android-tools
  ];

  idx = {
    extensions = [
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "bradlc.vscode-tailwindcss"
      "dsznajder.es7-react-js-snippets"
      "msjsdiag.vscode-react-native"
    ];

    workspace = {
      onCreate = {
        install-deps = "npm install";
        setup-android = ''
          echo "Setting up Android environment..."
          export ANDROID_HOME=$HOME/android-sdk
          export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
        '';
      };
      onStart = {
        expo-start = "npm start -- --tunnel";
      };
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "web"];
          manager = "web";
          env = {
            PORT = "3000";
          };
        };
        android = {
          command = ["npm" "run" "android"];
          manager = "android";
        };
      };
    };
  };
}
