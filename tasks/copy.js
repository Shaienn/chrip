module.exports = {
    main: {
        files: [
            {
                expand: true,
                cwd: '<%= settings.app %>/db',
                src: ['global.db'],
                dest: '<%= settings.dist %>/chrip-nw/<%= settings.build_platform %>/db'
            },
            {
                expand: true,
                cwd: '<%= settings.app %>/xml',
                src: ['**'],
                dest: '<%= settings.dist %>/chrip-nw/<%= settings.build_platform %>/xml'
            },
            {
                expand: true,
                cwd: '<%= settings.app %>/backgrounds',
                src: ['**'],
                dest: '<%= settings.dist %>/chrip-nw/<%= settings.build_platform %>/backgrounds'
            }
        ],
    }
};
