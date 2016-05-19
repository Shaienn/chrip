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
                cwd: '<%= settings.app %>/bible',
                src: ['**'],
                dest: '<%= settings.dist %>/chrip-nw/<%= settings.build_platform %>/bible'
            },
            {
                expand: true,
                cwd: '<%= settings.app %>/backgrounds',
                src: ['**'],
                dest: '<%= settings.dist %>/chrip-nw/<%= settings.build_platform %>/backgrounds'
            },
            {
                expand: true,
                cwd: '<%= settings.app %>/blockscreens',
                src: ['**'],
                dest: '<%= settings.dist %>/chrip-nw/<%= settings.build_platform %>/blockscreens'

            }
        ],
    }
};
