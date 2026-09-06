import React from 'react'
import { Container } from '../ui/Container'
import { Typography } from '../ui/Typography'

export const LiveFeeds = () => {
  return (
    <section className="py-16 lg:py-24 border-b border-ink bg-white relative z-10">
      <Container>
        <div className="mb-12">
          <Typography variant="h2" className="mb-4">
            Live Markets & News
          </Typography>
          <Typography variant="body" className="text-gray-600 max-w-2xl">
            Stay up to date with real-time global news broadcasts and live financial market data tracking key commodities and indices.
          </Typography>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Live News Feed (YouTube) */}
          <div className="flex flex-col h-full">
            <Typography variant="h3" className="mb-6">
              Live News Feed
            </Typography>
            <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 flex-grow shadow-md border border-gray-200" style={{ minHeight: '400px' }}>
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/videoseries?list=PLG8IrydigQfdgcLHjRy2W-R5GPYStPF6L" 
                title="Sky News - The Daily Climate Show" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Live Earth (YouTube) */}
          <div className="flex flex-col h-full">
            <Typography variant="h3" className="mb-6">
              Live Earth
            </Typography>
            <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 flex-grow shadow-md border border-gray-200" style={{ minHeight: '400px' }}>
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/M3HKLzjvKPc?autoplay=1&mute=1" 
                title="NASA Live Stream" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Stocks Live (TradingView) */}
          <div className="flex flex-col h-full lg:col-span-2 mt-4 lg:mt-8">
            <Typography variant="h3" className="mb-6">
              Stocks & Commodities
            </Typography>
            <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 flex-grow shadow-md border border-gray-200" style={{ minHeight: '500px' }}>
              {/* TradingView Widget BEGIN */}
              <div className="tradingview-widget-container" style={{ height: '100%', width: '100%' }}>
                <iframe
                  title="TradingView Market Overview"
                  src="https://s.tradingview.com/embed-widget/market-overview/?locale=en&colorTheme=light&isTransparent=true&showFloatingTooltip=true&scalePosition=no&scaleMode=Normal&fontFamily=-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif&tabs=%5B%7B%22title%22%3A%22Indices%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22CME_MINI%3AES1!%22%2C%22d%22%3A%22S%26P%20500%22%7D%2C%7B%22s%22%3A%22CME_MINI%3ANQ1!%22%2C%22d%22%3A%22Nasdaq%20100%22%7D%2C%7B%22s%22%3A%22DJ%3ADJI%22%2C%22d%22%3A%22Dow%20Jones%22%7D%5D%7D%2C%7B%22title%22%3A%22Commodities%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22NYMEX%3ACL1!%22%2C%22d%22%3A%22WTI%20Crude%20Oil%22%7D%2C%7B%22s%22%3A%22NYMEX%3ANG1!%22%2C%22d%22%3A%22Natural%20Gas%22%7D%2C%7B%22s%22%3A%22COMEX%3AGC1!%22%2C%22d%22%3A%22Gold%22%7D%5D%7D%5D"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                ></iframe>
              </div>
              {/* TradingView Widget END */}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
