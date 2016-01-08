module.exports = {
    options: {
        dir: '<%= settings.dist %>/chrip-nw/<%= settings.build_platform %>/bin/vlc',
        force: true,
        arch: '<%= settings.arch %>',
        platform: '<%= settings.build_platform %>'
    }
};