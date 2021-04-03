p5.disableFriendlyErrors = true;
var time;
var score= 0;
var highScore = 0;
var time_flash;
let track;

function preload() {
    soundFormats('wav','mp3');
    track = loadSound('assets/soundtrack.wav','assets/sountrack.mp3');
    font = loadFont('assets/Audiowide-Regular.ttf');
}

var gameinplay;
var timer_start;

var pFill;
var gameState = 1;
var gravity = 0.5;
// Air friction is applied constantly
var airFriction = 0.01;
// Friction is applied on collision with a surface
var friction = 0.02;
var ball;

//mobile vars
var mobileX;

// Initialise platforms which will be reused continuously
var platformL;
var platform1;
var platform2;
var platform3;
var platform4;
var platform5;
var platform6;
var platform7;
var platform8;
var platform9;
var platforms = [];

function setup() {
    createCanvas(1000, 1000);
    rectMode(CENTER);
    textFont(font);
    timer_start = millis();
    start();
}

function start(){
    mobileX = 0;
    lastAddition = 0;
    time_flash = millis();
    ball = new Ball(width/4,0,40,2,5,mobileX);  
    // Platform must be at least wide enough to hold the ball
    minWidth=ball.rad;
    // Max width of a platform is half the screen minus a gap for the ball to fit through
    maxWidth=(width/3-ball.rad);

    //row1
    platform1 = new Platform(round(random(minWidth,maxWidth)),25,round(random(0,width/3)),round(random(150,300)));
    platform2 = new Platform(round(random(minWidth,maxWidth)),25,round(random(width/3,width/3*2)),round(random(300,450)));
    platform3 = new Platform(round(random(minWidth,maxWidth)),25,round(random(width/3*2,width)),round(random(300,450)));

    //row2
    platform4 = new Platform(round(random(minWidth,maxWidth)),25,round(random(0,width/3)),round(random(450,600)));
    platform5 = new Platform(round(random(minWidth,maxWidth)),25,round(random(width/3,width/3*2)),round(random(600,750)));
    platform6 = new Platform(round(random(minWidth,maxWidth)),25,round(random(width/3*2,width)),round(random(600,750)));

    //row3
    platform7 = new Platform(round(random(minWidth,maxWidth)),25,round(random(0,width/3)),round(random(750,900)));
    platform8 = new Platform(round(random(minWidth,maxWidth)),25,round(random(width/3,width/3*2)),round(random(900,1000)));
    platform9 = new Platform(round(random(minWidth,maxWidth)),25,round(random(width/3*2,width)),round(random(900,1000)));

    platforms = [platform1,platform2,platform3,platform4,platform5,platform6,platform7,platform8,platform9];

    // Static
    platformL = new Platform(width/2-ball.rad,25,width/5,height/8);

    pFill = platform1.fill;
}

function home(){
    background(0);
    let s = 'Click to start game.';
    fill(255);
    
    textSize(30)
    text(s, width/1.65,height/2, width/2, 50); // Text wraps within

    if (mouseIsPressed) {
        if (mouseButton === LEFT) {
            track.loop();
            ball.alive = true;
            gameState = 2;
        }
    }
}

function flash(){
    platforms.forEach(element => element.fill = 'rgb(0,0,0)');
    var passedMillis = millis() - time_flash;
    if(passedMillis >=250){
        time_flash = millis();
        platforms.forEach(element => element.fill = 'rgb(255,0,0)');
    }
}

function getTime(){
    time = millis() - timer_start;
    var t;
    var s = round(time/1000)
    // We don't want to round this, or 90 seconds would make 2 minutes...
    var m = Math.floor(s/60);

    if(s < 60){
        t = s + " seconds";
    }
    else{
        if(s <= 120){
            // Seconds returns modulo of minute
            t = m + " minute " + s%60 + " seconds";
        }
        else{
            t = m + " minutes " + s%60 + " seconds";
        }
    }
    return t;
}

function play(){
    background(240,250,255);              
    noStroke();  

    document.getElementById("playerTime").innerHTML = "0 Seconds";
    
    // Constant platforms
    rect(platformL.x,platformL.y,platformL.width,platformL.height,20);
    //moving platforms
    rect(platform1.x,platform1.y,platform1.width,platform1.height,20);
    rect(platform2.x,platform2.y,platform2.width,platform2.height,20);
    rect(platform3.x,platform3.y,platform3.width,platform3.height,20);
    rect(platform4.x,platform4.y,platform4.width,platform4.height,20);
    rect(platform5.x,platform5.y,platform5.width,platform5.height,20);
    rect(platform6.x,platform6.y,platform6.width,platform6.height,20);
    rect(platform7.x,platform7.y,platform7.width,platform7.height,20);
    rect(platform8.x,platform8.y,platform8.width,platform8.height,20);
    rect(platform9.x,platform9.y,platform9.width,platform9.height,20);

    fill(0,200,55);
    circle(ball.x,ball.y,ball.rad);  
    ball.applyGravity(); 
    ball.remainOnScreen();  
    ball.accelerometerX = mobileX;

    ball.roll_L();
    ball.roll_R();

    platformL.checkCollision(ball);
    fill(pFill);
    // Wait until we've jumped off the starter platform
    // platform's 'hide' function will also reset our timer, so it won't start counting until after we've dropped into the main game
    if(platformL.hide(ball,this)){
        var myTime = getTime();  
        document.getElementById("playerTime").innerHTML = myTime;
        platforms.forEach(element => element.checkCollision(ball));
        platforms.forEach(element => element.moveUp());
        platforms.forEach(element => element.checkY(this));
        platforms.forEach(element => element.update(track,time));
        // Means we'll only check if the ball has collided with the ceiling AFTER the game has begun (it's okay to hit the ceiling while you're on the starter platform)
        ball.checkDeath(platformL);
        pFill = platform1.fill;
    }

    if(platform1.speed == 6){
        flash();
    }

    if(!ball.alive){
        // only when you die, check the time you died at and set that as your score for this game
        storeItem('score',getTime());
        setScore();
        gameState = 3;
    }
}

function setScore(){
    if(parseInt(getItem('highScore')) != null && getItem('highScore') != null){
        if(parseInt(getItem('score')) > parseInt(getItem('highScore'))){
            storeItem('highScore',getItem('score'));
        }
    }
    else{
        storeItem('highScore',getItem('score'));
    }
}

function resetSketch(){
    timer_start = millis();
}

function death(){
    score = getTime();
    resetSketch();
    track.pause();
    background(255,0,0);
    
    let s = 'You died! Click to play again.';
    let scoreText = 'Your score was: ' + getItem('score');

    let highScoreText = 'High score: ' + getItem('highScore');
    text(highScoreText,width/1.7,height/2+300,width/2,50)
    
    fill(0);
    textSize(30)
    text(s, width/1.8,height/3, width/2, 50); // Text wraps within
    text(scoreText,width/1.8,height/2,width/2,50);

    if (mouseIsPressed) {
        if (mouseButton === LEFT) {
            track.loop();
            resetSketch();
            start();
            ball.alive = true;
            gameState = 2;
        }
    }

    // For mobile
    function touchEnded() {
        if (value === 0) {
            track.loop();
            resetSketch();
            start();
            ball.alive = true;
            gameState = 2;
        }
    }
}

function checkState(){
    getTime();
    if(gameState == 1){
        home();
    }
    if(gameState == 2){
        play();
    }
    if(gameState == 3){
        death();
    }
}

function draw() {
    checkState(); 
}

window.addEventListener('devicemotion',function(e){
        mobileX = parseInt(e.accelerationIncludingGravity.x);
    });