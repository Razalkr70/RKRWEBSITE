
export const TrustStrip = () => {
  return (
    <section className="bg-gray-900 text-white py-12 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-base md:text-lg font-semibold tracking-widest uppercase mb-2" style={{ color: '#D1D5DB' }}>
              Technology should solve
            </h2>
            <p className="text-2xl md:text-4xl font-bold" style={{ color: 'white' }}>
              Real business problems.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {['AI', 'WEB', 'ANALYTICS', 'AUTOMATION'].map((item) => (
              <div key={item} className="text-lg md:text-xl font-bold tracking-wider hover:text-white transition-colors" style={{ color: '#9CA3AF' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
