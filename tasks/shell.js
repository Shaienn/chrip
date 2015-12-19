
module.exports = {
    set_target: {
         
    },
    win32: {
        command: [
            'cd <%= settings.app %>/node_modules/font_manager_nw',
            'rm -f ./build',
            'nw-gyp configure --runtime=node-webkit --target=0.12.3 --target_platform=win --target_arch=ia32',
            'nw-gyp build',
        ].join('&&')
    }
};