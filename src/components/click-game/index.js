import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import "./style.scss";

export const ClickGame = () => {

    const [playStatus, setPlayStatus] = useState(false);
    const [initBall, setInitBall] = useState(5);
    const [autoPlay, setAutoPlay] = useState(false);
    const [renderArray, setRenderArray] = useState([]);
    const [paused, setPaused] = useState(false);
    const [currentState, setCurrentState] = useState(0);
    const title = useRef();
    const body = useRef();
    const timeRef = useRef();

    const handleClickStart = () => {
        renderBall();
        setPlayStatus(true);
        timeRef.current?.startTimer();
    };

    const handleAutoPlay = () => {
        
    };

    const handleRestart = () => {
        resetState();
        renderBall();
    };

    const getRandomPosition = () => {
        const width = body.current.offsetWidth - 80;
        const height = body.current.offsetHeight - 80;   

        const x = Math.random() * width;
        const y = Math.random() * height;

        const positionLeft = x + 'px';
        const positionTop = y + 'px';

        return [positionLeft, positionTop];
    };

    const renderBall = () => {
        renderArray.length = 0;
        [...Array(initBall)].map((_, idx) => {
            const [left, top] = getRandomPosition();
            const obj =  {
                key: Math.random(),
                number: idx + 1,
                left,
                top
            };
            renderArray.push(obj);
        });
        setCurrentState(renderArray[0].number);
        setRenderArray([...renderArray]);
    };

    const failLogic = () => {
        timeRef.current?.stopTimer();
        title.current?.fail();
        setPaused(true)

    };

    const passLogic = () => {
        timeRef.current.stopTimer();
        title.current?.success();
    };

    const clickBall = (number) => {
        setCurrentState(number);
    }

    const resetState = () => {
        setPaused(false);
        setAutoPlay(false);
        timeRef.current?.resetTimer();
        title.current?.init();
    };

    useEffect(() => {
        if(autoPlay) {

        }
    }, [autoPlay]);

    return (
        <div className="body">
            <div className="container">
                <div className="container__header">
                    <Title ref={title} />
                    <div className="form-group">
                        <span className="text"> Points: </span>
                        <input type="text" onChange={(e) => setInitBall(+e.target.value)} value={initBall} className="form-input" />
                    </div>
                    <div className="form-group">
                        <span className="text">Time: </span>
                        <span className="text"><Timer ref={timeRef} /></span>
                    </div>
                    <div className="form-group">
                        {!playStatus ? <button onClick={handleClickStart} className="button">Play</button>
                                        : <><button onClick={handleRestart} className="button">Restart</button>
                                            <button onClick={() => setAutoPlay(pre => !pre)} className="button">Auto Play {autoPlay ? 'ON' : 'OFF'}</button></>}
                    </div>
                </div>
                <div ref={body} className="container__body">
                    <BallList renderArray={renderArray} isPaused={paused} failLogic={failLogic} passLogic={passLogic} isAuto={autoPlay} clickBall={clickBall} />
                </div>
                <div className="container__footer">
                    <span className="text">Next: {currentState}</span>
                </div>
            </div>
        </div>
    )
};

const Title = forwardRef((props, ref) => {
    const [fail, setFail] = useState(false);
    const [success, setSuccess] = useState(false);

    useImperativeHandle(ref, () => ({
        init() {
            setFail(false);
            setSuccess(false);
        },
        fail() {
            setFail(pre => !pre);
        },
        success() {
            setSuccess(pre => !pre);
        }
    }))

    if(!fail && !success) return <h2 className="header">LET'S PLAY</h2>;
    if(success) return <h2 className="header pass">ALL CLEARED</h2>;
    if(fail) return <h2 className="header fail">GAME OVER</h2>
})

const Timer = forwardRef((props, ref) => {
    const [time, setTime] = useState({
        intervalId: null,
        seconds: 0,
        miliseconds: 0
    });

    useImperativeHandle(ref, () => ({
        startTimer () {
            clearInterval(time.intervalId);
            time.intervalId = setInterval(() => {
                time.miliseconds++;
                setTime({...time})
                if(time.miliseconds === 10) {
                    time.seconds++;
                    time.miliseconds = 0;
                    setTime({...time});
                }
            }, 100);
        },
        resetTimer () {
            clearInterval(time.intervalId);
            time.intervalId = null;
            time.seconds = 0;
            time.miliseconds = 0;
            setTime({...time});
            time.intervalId = setInterval(() => {
                time.miliseconds++;
                setTime({...time});
                if(time.miliseconds === 10) {
                    time.seconds++;
                    time.miliseconds = 0;
                    setTime({...time});
                }
            }, 100);
        },
        stopTimer() {
            clearInterval(time.intervalId);
        }
    }));

    return <span className="text">{`${time.seconds}.${time.miliseconds}`}</span>;
});

const CountDownTimer = forwardRef((props, ref) => {

    const {isShow, isDone} = props;

    const [time, setTime] = useState({
        intervalId: null, 
        seconds: 2, 
        miliseconds: 10
    });

    useImperativeHandle(ref, () => ({
        startTimer() {
            clearInterval(time.intervalId);
            time.intervalId = setInterval(() => {
                time.miliseconds--;
                setTime({...time})
                if(time.miliseconds === 0) {
                    if(time.seconds === 0) {
                        isDone();
                    }
                    time.seconds--;
                    time.miliseconds = 10;
                    setTime({...time})
                };
            }, 100);
        },
        stopTimer() {
            clearInterval(time.intervalId);
        }
    }));

    return isShow && <span className="ball__counter">{`${time.seconds}.${time.miliseconds}`}</span>
});

const Ball = forwardRef((props, ref) => {
    const {number, offsetLeft, offsetTop, isPaused, zIndex, handleBallClick, lastChild, passLogic, stopAutoPlay} = props;
    
    const timeRef = useRef();
    const ball = useRef();

    const [firstClick, setFirstClick] = useState(false);
    const [showCounter, setShowCounter] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [paused, setPaused] = useState(false);
    const [invisible, setInvisible] = useState(false);

    const handleClickBall = () => {
        setFirstClick(true);
        setIsRunning(true);
        handleBallClick(number);    
        setShowCounter(true);
        timeRef.current?.startTimer();
    };

    const handleTimeOut = () => {
        lastChild && passLogic();
        setInvisible(pre => !pre);
    };

    const hanlePaused = () => {
        timeRef.current?.stopTimer();
        setPaused(pre => !pre);
    };

    useEffect(() => {
        hanlePaused();
        isPaused && setFirstClick(true);
    }, [isPaused]);

    useImperativeHandle(ref, () => ({
        click() {
            handleClickBall();
            lastChild && stopAutoPlay();
        }
    }));

    return (
        !invisible && 
        <div style={{top: offsetTop, left: offsetLeft, 
                    animationName: isRunning ? 'fadeAway' : '',
                    animationDuration: '3s',
                    animationTimingFunction: "ease-in-out",
                    animationPlayState: paused ? 'paused' : 'running', 
                    zIndex: zIndex}} 
            ref={ball} onClick={!firstClick ? handleClickBall : null} className="ball">
            <span className="ball__number">{number}</span>
            <CountDownTimer isDone={handleTimeOut} isShow={showCounter} ref={timeRef} />  
        </div>
    )
});

const BallList = (props) => {

    const {renderArray, isPaused, failLogic, passLogic, clickBall, isAuto} = props;
    const [lastChild, setLastChild] = useState(false);
    const [autoPlay, setAutoPlay] = useState({
        state: 0,
        intervalId: null
    });
    const [currentState, setCurrentState] = useState({
        state: 0,
        array: []
    });
    const ballRefs = useRef([]);

    useEffect(() => {
        if(renderArray) {
            const arr = renderArray.map(item => item.number);
            ballRefs.current = ballRefs.current.slice(0, renderArray.length);
            setCurrentState({...currentState, state: arr[0], array: arr});
            setLastChild(false);
            setAutoPlay({...autoPlay, state: 0, intervalId: null});
        }
    }, [renderArray]);

    const clickOrderBall = (number) => {
        if(number == currentState.state) {
            const lastChild = currentState.array[currentState.array.length - 1];
            if(lastChild != number) {
                currentState.state = currentState.array[number];
                if(currentState.state === lastChild) {
                    setLastChild(true);
                }
                clickBall(currentState.state);
            }
        } else {
            failLogic();
        };
    };

    const startAutoPlay = () => {
        autoPlay.intervalId = setInterval(() => {
            ballRefs.current[currentState.state].click();
        }, 1000);
    };

    const stopAutoPlay = () => {
        clearInterval(autoPlay.intervalId);
    };

    useEffect(() => {
        isAuto ? startAutoPlay() : stopAutoPlay();
    }, [isAuto]);

    return renderArray.map((item) => {
        return <Ball 
                    handleBallClick={clickOrderBall}
                    key={item.key} 
                    offsetLeft={item.left} 
                    zIndex={renderArray.length - item.number} 
                    offsetTop={item.top} 
                    number={item.number} 
                    isPaused={isPaused}
                    lastChild={lastChild}
                    passLogic={passLogic}
                    isAutoPlay={isAuto}
                    state={currentState.state}
                    ref={i => ballRefs.current[item.number] = i}
                    stopAutoPlay={stopAutoPlay}
                />
    });
}
