module.exports = {
    options: {
        buildDir: '<%= settings.dist %>', // Where the build version of my node-webkit app is saved
        platforms: ['linux32', 'linux64', 'win64'],
        version: '0.12.3',
    },
    src: [
        '<%= settings.app %>/package.json',
        '<%= settings.app %>/node_modules/**/*',
        '<%= settings.app %>/*.html',
        '<%= settings.app %>/*.js',
        '<%= settings.app %>/*.txt',
        '<%= settings.app %>/templates/**/*',
        '<%= settings.app %>/java/**/*.class',
        '<%= settings.app %>/lib/**/*',
        '<%= settings.app %>/vendor/**/*',
        '<%= settings.app %>/images/**/*',
        '<%= settings.app %>/css/**/*',
        '<%= settings.app %>/dist/**/*',
        '<%= settings.app %>/sqlite/**/*',
        '<%= settings.app %>/db/**/*',
        '<%= settings.app %>/backgrounds/**/*',
    ]
};
