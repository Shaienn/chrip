module.exports = {
    options: {
        buildDir: '<%= settings.dist %>', 
        platforms: ['<%= settings.build_platform %>'],
        version: '0.12.3',
    },
    src: [
        '<%= settings.app %>/package.json',
        '<%= settings.app %>/node_modules/**/*',
        '<%= settings.app %>/*.html',
        '<%= settings.app %>/*.js',
        '<%= settings.app %>/templates/**/*',
        '<%= settings.app %>/lib/**/*',
        '<%= settings.app %>/vendor/**/*',
        '<%= settings.app %>/images/**/*',
        '<%= settings.app %>/css/**/*',
    ]
};
