module.exports = {
    options: {
        version: 'latest',
        dir: '<%= settings.dist %>/chrip-nw/<%= settings.build_platform %>/bin/wcjs',
        force: true,
        runtime: {
            type: 'nw.js',
            version: 'latest',
            arch: '<%= settings.arch %>', 
            platform: '<%= settings.os %>'
        }
    }
};