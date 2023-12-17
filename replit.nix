{ pkgs }: {
  deps = [
    pkgs.nodejs-17_x
    pkgs.python310
    pkgs.neofetch
    pkgs.openssh_with_kerberos
    pkgs.nodePackages.typescript
    pkgs.nodePackages.pm2
    pkgs.arcan.ffmpeg
    pkgs.yarn
    pkgs.libwebp
    pkgs.imagemagick
    pkgs.libuuid
  ];
  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.libuuid
    ];
  };
}