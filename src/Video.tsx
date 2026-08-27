import { useEvent } from 'expo';
import { useVideoPlayer, VideoView, type VideoSource, type VideoViewProps } from 'expo-video';
import { forwardRef, useImperativeHandle } from 'react';

export const Video = forwardRef<
  ReturnType<typeof useVideoPlayer>,
  Omit<VideoViewProps, 'player'> & {
    source: VideoSource;
    setup?: (player: ReturnType<typeof useVideoPlayer>) => void;
  }
>(({ source, setup, ...props }, ref) => {
  const player = useVideoPlayer(source, setup);
  useEvent(player, 'statusChange', { status: player.status });
  useEvent(player, 'playingChange', { isPlaying: player.playing });
  useImperativeHandle(ref, () => player, [player]);
  return <VideoView player={player} {...props} />;
});
