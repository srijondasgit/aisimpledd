export const MODEL_TYPES = {
  TRANSFORMER: 'Transformer',
  PERFORMER: 'Performer',
  BERT: 'BERT',
  GPT: 'GPT',
  CUSTOM: 'Custom'
};

export const MODEL_COMPONENTS = {
  [MODEL_TYPES.TRANSFORMER]: {
    'Tokenization': {
      code: `self.tokenizer = SomeTokenizer()`,
      description: 'Tokenizes input text'
    },
    'Embedding': {
      code: `self.embedding = nn.Embedding(vocab_size, embed_dim)`,
      description: 'Converts tokens to embeddings'
    },
    'Positional Encoding': {
      code: `self.pos_encoding = PositionalEncoding(embed_dim)`,
      description: 'Adds positional information'
    },
    'Multi-Head Attention': {
      code: `self.attn = nn.MultiheadAttention(embed_dim, num_heads)`,
      description: 'Standard multi-head attention'
    },
    'FFN': {
      code: `self.ffn = nn.Sequential(nn.Linear(embed_dim, hidden_dim), nn.ReLU())`,
      description: 'Feed-forward network'
    },
    'Residual Connection': {
      code: `# residual connection handled in forward`,
      description: 'Adds residual connection'
    },
    'Layer Normalization': {
      code: `self.layer_norm = nn.LayerNorm(embed_dim)`,
      description: 'Normalizes layer outputs'
    },
    'LM Head': {
      code: `self.lm_head = nn.Linear(hidden_dim, vocab_size)`,
      description: 'Language modeling head'
    }
  },
  [MODEL_TYPES.PERFORMER]: {
    'Tokenization': {
      code: `self.tokenizer = SomeTokenizer()`,
      description: 'Tokenizes input text'
    },
    'Embedding': {
      code: `self.embedding = nn.Embedding(vocab_size, embed_dim)`,
      description: 'Converts tokens to embeddings'
    },
    'Positional Encoding': {
      code: `self.pos_encoding = PositionalEncoding(embed_dim)`,
      description: 'Adds positional information'
    },
    'Performer Attention': {
      code: `self.attn = PerformerAttention(embed_dim, num_heads, kernel_type='relu')`,
      description: 'Performer attention with kernel approximation'
    },
    'FFN': {
      code: `self.ffn = nn.Sequential(nn.Linear(embed_dim, hidden_dim), nn.ReLU())`,
      description: 'Feed-forward network'
    },
    'Residual Connection': {
      code: `# residual connection handled in forward`,
      description: 'Adds residual connection'
    },
    'Layer Normalization': {
      code: `self.layer_norm = nn.LayerNorm(embed_dim)`,
      description: 'Normalizes layer outputs'
    },
    'LM Head': {
      code: `self.lm_head = nn.Linear(hidden_dim, vocab_size)`,
      description: 'Language modeling head'
    }
  },
  [MODEL_TYPES.BERT]: {
    'Tokenization': {
      code: `self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')`,
      description: 'BERT tokenizer'
    },
    'Embedding': {
      code: `self.embedding = BertEmbeddings(config)`,
      description: 'BERT embeddings with token, position, and segment embeddings'
    },
    'Transformer Layer': {
      code: `self.transformer = BertLayer(config)`,
      description: 'BERT transformer layer'
    },
    'Pooler': {
      code: `self.pooler = BertPooler(config)`,
      description: 'BERT pooler for [CLS] token'
    },
    'Classification Head': {
      code: `self.classifier = nn.Linear(hidden_size, num_labels)`,
      description: 'Classification head for downstream tasks'
    }
  },
  [MODEL_TYPES.GPT]: {
    'Tokenization': {
      code: `self.tokenizer = GPT2Tokenizer.from_pretrained('gpt2')`,
      description: 'GPT tokenizer'
    },
    'Embedding': {
      code: `self.embedding = nn.Embedding(vocab_size, embed_dim)`,
      description: 'Token embeddings'
    },
    'Positional Encoding': {
      code: `self.pos_encoding = PositionalEncoding(embed_dim)`,
      description: 'Adds positional information'
    },
    'Masked Multi-Head Attention': {
      code: `self.attn = nn.MultiheadAttention(embed_dim, num_heads)`,
      description: 'Masked multi-head attention'
    },
    'FFN': {
      code: `self.ffn = nn.Sequential(nn.Linear(embed_dim, hidden_dim), nn.GELU())`,
      description: 'Feed-forward network with GELU'
    },
    'Layer Normalization': {
      code: `self.layer_norm = nn.LayerNorm(embed_dim)`,
      description: 'Normalizes layer outputs'
    },
    'LM Head': {
      code: `self.lm_head = nn.Linear(hidden_dim, vocab_size)`,
      description: 'Language modeling head'
    }
  }
};

// Helper function to get available components for a model type
export const getModelComponents = (modelType) => {
  return MODEL_COMPONENTS[modelType] || MODEL_COMPONENTS[MODEL_TYPES.CUSTOM];
};

// Helper function to get component code
export const getComponentCode = (modelType, componentName) => {
  const components = getModelComponents(modelType);
  return components[componentName]?.code || `# Unknown component: ${componentName}`;
};
  