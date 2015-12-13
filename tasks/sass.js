module.exports = {
    options: {
        sourceMap: true
    },
    production: {
        options: {
            outputStyle: 'compressed',
        },
        files: [{
            expand: true,
            cwd: '<%= settings.app %>/css',
            src: ['*.scss'],
            dest: '<%= settings.dist %>/css',
            ext: '.css',
        }]
    },
    dev: {
        options: {
            sourceComments: true,
            outputStyle: 'expanded'
        },
        files: [{
            expand: true,
            cwd: '<%= settings.app %>/css',
            src: ['*.scss'],
            dest: '<%= settings.dist %>/css',
            ext: '.css',
        }]
    }
};
