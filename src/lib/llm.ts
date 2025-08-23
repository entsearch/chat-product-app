export const mockLLMResponse = (query: string) => {
  const baseCards = [
    { id: 'tv1', name: 'Neo OLED 4K', image: 'https://images.samsung.com/is/image/samsung/p6pim/us/qn75qn1efafxza/gallery/us-neo-qled-qn75qn1efafxza-front-black-546228291?$product-details-jpg$', specs: { size: '65in', refresh_rate: '120Hz', price: '$999' }, learn_more: 'QLED offers vibrant colors...' },
    { id: 'tv2', name: 'Samsung QLED TV', image: 'https://image-us.samsung.com/SamsungUS/home/television-home-theater/tvs/the-terrace/08272024/QN55LST7DAFXZA_007_Front3_Titan_Black_Scom_1600x1200.jpg?$product-details-jpg$', specs: { size: '75in', refresh_rate: '120Hz', price: '$1499' }, learn_more: 'OLED delivers deep blacks...' },
    { id: 'tv3', name: 'Neo QLED 4K', image: 'https://image-us.samsung.com/SamsungUS/home/television-home-theater/tvs/the-terrace/08262024/QN55LST7DAFXZA_007_Front3_Titan_Black_Scom_1600x1200.jpg?$product-details-jpg$', specs: { size: '55in', refresh_rate: '60Hz', price: '$799' }, learn_more: '4K for sharp visuals...' },
    { id: 'tv4', name: 'Vision AI Smart TV', image: 'https://images.samsung.com/is/image/samsung/p6pim/us/qn75qef1afxza/gallery/us-qled-qef1-548500-qn75qef1afxza-547033885?$product-details-jpg$', specs: { size: '65in', refresh_rate: '120Hz', price: '$999' }, learn_more: 'QLED offers vibrant colors...' },
    { id: 'tv5', name: 'QLED 4K QE1D', image: 'https://image-us.samsung.com/SamsungUS/home/television-home-theater/tvs/qled-4k-tvs/0715202439102/70_65-S.COM_Version_1_V01.jpg?$product-details-jpg$', specs: { size: '75in', refresh_rate: '120Hz', price: '$1499' }, learn_more: 'OLED delivers deep blacks...' },
    { id: 'tv6', name: 'Crystal UHD U7900F', image: 'https://images.samsung.com/is/image/samsung/p6pim/us/un58u7900ffxza/gallery/us-uhd-4k-tv-un58u7900ffxza-front-black-548283704?$product-details-jpg$', specs: { size: '55in', refresh_rate: '60Hz', price: '$799' }, learn_more: '4K for sharp visuals...' },
  ];

  // Parse query for filters or actions
  let cards = baseCards;
  let comparison = null;
  let response_text = `Found ${cards.length} TVs matching "${query}":`;
  let proactive_tip = query.includes('gaming') ? null : 'Would you like to learn about OLED technology or gaming TVs?';

  // Filter by price, size, or refresh rate
  if (query.toLowerCase().includes('under $1000')) {
    cards = baseCards.filter((tv) => parseFloat(tv.specs.price.replace('$', '')) < 1000);
    response_text = `Found ${cards.length} TVs under $1000:`;
  } else if (query.toLowerCase().includes('75 inches')) {
    cards = baseCards.filter((tv) => tv.specs.size.includes('75in'));
    response_text = `Found ${cards.length} TVs over 75 inches:`;
  } else if (query.toLowerCase().includes('120hz')) {
    cards = baseCards.filter((tv) => tv.specs.refresh_rate.includes('120Hz'));
    response_text = `Found ${cards.length} TVs with 120Hz refresh rate:`;
  }

  // Handle comparison or selection actions
  if (query.toLowerCase().includes('compare') || query.toLowerCase().includes('selected tvs')) {
    const tvNames = query.match(/Neo OLED 4K|Samsung QLED TV|Neo QLED 4K|Vision AI Smart TV|QLED 4K QE1D|Crystal UHD U7900F/gi) || [];
    const selectedTVs = baseCards.filter((tv) => tvNames.includes(tv.name)).slice(0, 3);
    comparison = selectedTVs.length >= 2 ? selectedTVs : null;
    response_text = comparison ? `Comparing ${selectedTVs.length} TVs:` : 'Please select at least 2 TVs to compare.';
    cards = []; // No cards in comparison response—show in sheet
    proactive_tip = selectedTVs.length < 2 ? 'Add more TVs to compare (e.g., "add Neo OLED 4K to comparison").' : null;
  } else if (query.toLowerCase().includes('add') && query.toLowerCase().includes('comparison')) {
    const tvName = query.match(/Neo OLED 4K|Samsung QLED TV|Neo QLED 4K|Vision AI Smart TV|QLED 4K QE1D|Crystal UHD U7900F/i)?.[0];
    const tv = baseCards.find((tv) => tv.name === tvName);
    response_text = tv ? `Added ${tvName} to comparison.` : `TV not found. Try again (e.g., "add Samsung QLED TV").`;
    cards = [];
    proactive_tip = 'Add up to 3 TVs and say "compare selected TVs" to view comparison.';
  } else if (query.toLowerCase().includes('remove') && query.toLowerCase().includes('comparison')) {
    const tvName = query.match(/Neo OLED 4K|Samsung QLED TV|Neo QLED 4K|Vision AI Smart TV|QLED 4K QE1D|Crystal UHD U7900F/i)?.[0];
    response_text = tvName ? `Removed ${tvName} from comparison.` : `TV not found.`;
    cards = [];
    proactive_tip = 'Add or compare TVs to continue.';
  }

  return {
    response_text,
    cards,
    proactive_tip,
    comparison,
  };
};
