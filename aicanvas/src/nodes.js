export const nodeTypes = [
    'Tokenization',
    'Embedding',
    'Attention Layer',
    'FFN',
    'Residual Connection',
    'LM Head',
  ];
  
  export const NODE_CODE_MAP = {
    'Tokenization': `self.tokenizer = SomeTokenizer()`,
    'Embedding': `self.embedding = nn.Embedding(vocab_size, embed_dim)`,
    'Attention Layer': `self.attn = nn.MultiheadAttention(embed_dim, num_heads)`,
    'FFN': `self.ffn = nn.Sequential(nn.Linear(embed_dim, hidden_dim), nn.ReLU())`,
    'Residual Connection': `# residual connection handled in forward`,
    'LM Head': `self.lm_head = nn.Linear(hidden_dim, vocab_size)`,
  };
  