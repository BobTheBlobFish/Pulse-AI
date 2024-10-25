"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Circle } from 'lucide-react';

const MorseDecoder = () => {
  const [pattern, setPattern] = useState<number[]>([0, 0, 0, 0]);
  const [counter, setCounter] = useState(0);
  const [output, setOutput] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const [pressStartTime, setPressStartTime] = useState<number>(0);
  const [lastReleaseTime, setLastReleaseTime] = useState<number>(0);

  const PATTERN_LENGTH = 4;
  const INTRA_CHARACTER_PAUSE = 500;

  const morseToChar: { [key: string]: string } = {
    '100,0,0,0': 'E',   // .
    '300,0,0,0': 'T',   // -
    '100,100,0,0': 'I', // ..
    '300,300,0,0': 'M', // --
    '100,300,0,0': 'A', // .-
    '300,100,0,0': 'N', // -.
    '100,100,100,0': 'S', // ...
    '300,300,300,0': 'O', // ---
    '100,100,300,0': 'U', // ..-
    '100,300,100,0': 'R', // .-.
    '300,100,100,0': 'D', // -..
    '100,300,300,0': 'W', // .--
    '300,100,300,0': 'K', // -.-
    '300,300,100,0': 'G', // --.
  };

  const handlePress = () => {
    setIsPressed(true);
    setPressStartTime(Date.now());
  };

  const onCharacterReceive = useCallback(() => {
    const key = pattern.join(',');
    const char = morseToChar[key] || '?';
    
    setOutput(prev => prev + char);
    setCounter(0);
    setPattern([0, 0, 0, 0]);
  }, [pattern]);

  const handleRelease = () => {
    setIsPressed(false);
    const duration = Date.now() - pressStartTime;
    const newPattern = [...pattern];
    newPattern[counter] = duration > 200 ? 300 : 100;
    
    setPattern(newPattern);
    setLastReleaseTime(Date.now());
    setCounter(prev => prev + 1);

    if (counter + 1 === PATTERN_LENGTH) {
      onCharacterReceive();
    }
  };

  useEffect(() => {
    if (!isPressed && counter > 0) {
      const checkTimeout = setInterval(() => {
        if (Date.now() - lastReleaseTime > INTRA_CHARACTER_PAUSE) {
          onCharacterReceive();
          clearInterval(checkTimeout);
        }
      }, 100);

      return () => clearInterval(checkTimeout);
    }
  }, [isPressed, counter, lastReleaseTime, onCharacterReceive]);

  return (
    <Card className="w-full max-w-md mx-auto my-10 ">
      <CardHeader>
        <CardTitle className='flex align-middle w-full items-center justify-center '>Morse Code Decoder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Button 
            className="w-32 h-32 rounded-full"
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
          >
            <Circle 
              className={`w-24 h-24 transition-colors ${isPressed ? 'text-red-500' : 'text-gray-400'}`}
              fill={isPressed ? 'currentColor' : 'none'}
            />
          </Button>
        </div>

        <div className="text-center space-y-2">
          <div className="text-sm text-gray-500">
            Current Pattern: {pattern.map(p => p === 300 ? '-' : p === 100 ? '.' : '_').join('')}
          </div>
          <div className="min-h-16 p-4 bg-gray-100 rounded-lg break-words">
            <p className="text-xl font-mono">{output || 'Output will appear here'}</p>
          </div>
          {output && (
            <Button 
              variant="outline" 
              onClick={() => {
                setOutput('');
                setPattern([0, 0, 0, 0]);
                setCounter(0);
              }}
              className="mt-2"
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MorseDecoder;