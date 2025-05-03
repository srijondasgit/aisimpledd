export const MODEL_TYPES = {
  TRANSFORMER: 'Transformer',
  PERFORMER: 'Performer',
  BERT: 'BERT',
  GPT: 'GPT',
  CUSTOM: 'Custom'
};

// Define the order of components for each model type
export const MODEL_COMPONENT_ORDER = {
  [MODEL_TYPES.TRANSFORMER]: [
    'Tokenization',
    'Embedding',
    'Positional Encoding',
    'Multi-Head Attention',
    'FFN',
    'Residual Connection',
    'Layer Normalization',
    'LM Head'
  ],
  [MODEL_TYPES.PERFORMER]: [
    'Tokenization',
    'Embedding',
    'Positional Encoding',
    'Performer Attention',
    'FFN',
    'Residual Connection',
    'Layer Normalization',
    'LM Head'
  ],
  [MODEL_TYPES.BERT]: [
    'Tokenization',
    'Embedding',
    'Transformer Layer',
    'Pooler',
    'Classification Head'
  ],
  [MODEL_TYPES.GPT]: [
    'Tokenization',
    'Embedding',
    'Positional Encoding',
    'Masked Multi-Head Attention',
    'FFN',
    'Layer Normalization',
    'LM Head'
  ]
};

export const MODEL_COMPONENTS = {
  [MODEL_TYPES.TRANSFORMER]: {
    'Tokenization': {
      code: (params) => `self.tokenizer = SomeTokenizer(${params.vocabSize ? `vocab_size=${params.vocabSize}` : ''})`,
      description: 'Tokenizes input text',
      dependencies: [],
      isRequired: true,
      mustBeFirst: true,
      allowMultiple: false,
      defaultValues: {
        vocabSize: 30522
      },
      parameters: [
        { name: 'vocabSize', type: 'number', label: 'Vocabulary Size', min: 1000, max: 100000 }
      ]
    },
    'Embedding': {
      code: (params) => `self.embedding = nn.Embedding(${params.vocabSize || 'vocab_size'}, ${params.embedDim || 'embed_dim'})`,
      description: 'Converts tokens to embeddings',
      dependencies: ['Tokenization'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        vocabSize: 30522,
        embedDim: 768
      },
      parameters: [
        { name: 'vocabSize', type: 'number', label: 'Vocabulary Size', min: 1000, max: 100000 },
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 }
      ]
    },
    'Positional Encoding': {
      code: (params) => `self.pos_encoding = PositionalEncoding(${params.embedDim || 'embed_dim'}, ${params.maxSeqLen || 'max_seq_len'})`,
      description: 'Adds positional information',
      dependencies: ['Embedding'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        embedDim: 768,
        maxSeqLen: 512
      },
      parameters: [
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 },
        { name: 'maxSeqLen', type: 'number', label: 'Maximum Sequence Length', min: 32, max: 4096 }
      ]
    },
    'Multi-Head Attention': {
      code: (params) => `self.attn = nn.MultiheadAttention(${params.embedDim || 'embed_dim'}, ${params.numHeads || 'num_heads'}, dropout=${params.dropout || 0.1})`,
      description: 'Standard multi-head attention',
      dependencies: ['Positional Encoding'],
      isRequired: true,
      allowMultiple: true,
      defaultValues: {
        embedDim: 768,
        numHeads: 12,
        dropout: 0.1
      },
      parameters: [
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 },
        { name: 'numHeads', type: 'number', label: 'Number of Attention Heads', min: 1, max: 64 },
        { name: 'dropout', type: 'number', label: 'Dropout Rate', min: 0, max: 1, step: 0.1 }
      ]
    },
    'FFN': {
      code: (params) => `self.ffn = nn.Sequential(
    nn.Linear(${params.embedDim || 'embed_dim'}, ${params.hiddenDim || 'hidden_dim'}),
    nn.ReLU(),
    nn.Dropout(${params.dropout || 0.1}),
    nn.Linear(${params.hiddenDim || 'hidden_dim'}, ${params.embedDim || 'embed_dim'})
)`,
      description: 'Feed-forward network',
      dependencies: ['Multi-Head Attention'],
      isRequired: true,
      allowMultiple: true,
      defaultValues: {
        embedDim: 768,
        hiddenDim: 3072,
        dropout: 0.1
      },
      parameters: [
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 },
        { name: 'hiddenDim', type: 'number', label: 'Hidden Dimension', min: 128, max: 16384 },
        { name: 'dropout', type: 'number', label: 'Dropout Rate', min: 0, max: 1, step: 0.1 }
      ]
    },
    'Residual Connection': {
      code: (params) => `# residual connection handled in forward`,
      description: 'Adds residual connection',
      dependencies: ['FFN'],
      isRequired: true,
      allowMultiple: true,
      defaultValues: {},
      parameters: []
    },
    'Layer Normalization': {
      code: (params) => `self.layer_norm = nn.LayerNorm(${params.embedDim || 'embed_dim'}, eps=${params.eps || 1e-12})`,
      description: 'Normalizes layer outputs',
      dependencies: ['Residual Connection'],
      isRequired: true,
      allowMultiple: true,
      defaultValues: {
        embedDim: 768,
        eps: 1e-12
      },
      parameters: [
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 },
        { name: 'eps', type: 'number', label: 'Epsilon', min: 1e-20, max: 1e-6, step: 1e-12 }
      ]
    },
    'LM Head': {
      code: (params) => `self.lm_head = nn.Linear(${params.hiddenDim || 'hidden_dim'}, ${params.vocabSize || 'vocab_size'})`,
      description: 'Language modeling head',
      dependencies: ['Layer Normalization'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        hiddenDim: 768,
        vocabSize: 30522
      },
      parameters: [
        { name: 'hiddenDim', type: 'number', label: 'Hidden Dimension', min: 64, max: 4096 },
        { name: 'vocabSize', type: 'number', label: 'Vocabulary Size', min: 1000, max: 100000 }
      ]
    }
  },
  [MODEL_TYPES.PERFORMER]: {
    'Tokenization': {
      code: `self.tokenizer = SomeTokenizer()`,
      description: 'Tokenizes input text',
      dependencies: [],
      isRequired: true,
      mustBeFirst: true,
      allowMultiple: false
    },
    'Embedding': {
      code: `self.embedding = nn.Embedding(vocab_size, embed_dim)`,
      description: 'Converts tokens to embeddings',
      dependencies: ['Tokenization'],
      isRequired: true,
      allowMultiple: false
    },
    'Positional Encoding': {
      code: `self.pos_encoding = PositionalEncoding(embed_dim)`,
      description: 'Adds positional information',
      dependencies: ['Embedding'],
      isRequired: true,
      allowMultiple: false
    },
    'Performer Attention': {
      code: `self.attn = PerformerAttention(embed_dim, num_heads, kernel_type='relu')`,
      description: 'Performer attention with kernel approximation',
      dependencies: ['Positional Encoding'],
      isRequired: true,
      allowMultiple: true
    },
    'FFN': {
      code: `self.ffn = nn.Sequential(nn.Linear(embed_dim, hidden_dim), nn.ReLU())`,
      description: 'Feed-forward network',
      dependencies: ['Performer Attention'],
      isRequired: true,
      allowMultiple: true
    },
    'Residual Connection': {
      code: `# residual connection handled in forward`,
      description: 'Adds residual connection',
      dependencies: ['FFN'],
      isRequired: true,
      allowMultiple: true
    },
    'Layer Normalization': {
      code: `self.layer_norm = nn.LayerNorm(embed_dim)`,
      description: 'Normalizes layer outputs',
      dependencies: ['Residual Connection'],
      isRequired: true,
      allowMultiple: true
    },
    'LM Head': {
      code: `self.lm_head = nn.Linear(hidden_dim, vocab_size)`,
      description: 'Language modeling head',
      dependencies: ['Layer Normalization'],
      isRequired: true,
      allowMultiple: false
    }
  },
  [MODEL_TYPES.BERT]: {
    'Tokenization': {
      code: `self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')`,
      description: 'BERT tokenizer',
      dependencies: [],
      isRequired: true,
      mustBeFirst: true,
      allowMultiple: false
    },
    'Embedding': {
      code: `self.embedding = BertEmbeddings(config)`,
      description: 'BERT embeddings with token, position, and segment embeddings',
      dependencies: ['Tokenization'],
      isRequired: true,
      allowMultiple: false
    },
    'Transformer Layer': {
      code: `self.transformer = BertLayer(config)`,
      description: 'BERT transformer layer',
      dependencies: ['Embedding'],
      isRequired: true,
      allowMultiple: true
    },
    'Pooler': {
      code: `self.pooler = BertPooler(config)`,
      description: 'BERT pooler for [CLS] token',
      dependencies: ['Transformer Layer'],
      isRequired: true,
      allowMultiple: false
    },
    'Classification Head': {
      code: `self.classifier = nn.Linear(hidden_size, num_labels)`,
      description: 'Classification head for downstream tasks',
      dependencies: ['Pooler'],
      isRequired: true,
      allowMultiple: false
    }
  },
  [MODEL_TYPES.GPT]: {
    'Tokenization': {
      code: `self.tokenizer = GPT2Tokenizer.from_pretrained('gpt2')`,
      description: 'GPT tokenizer',
      dependencies: [],
      isRequired: true,
      mustBeFirst: true,
      allowMultiple: false
    },
    'Embedding': {
      code: `self.embedding = nn.Embedding(vocab_size, embed_dim)`,
      description: 'Token embeddings',
      dependencies: ['Tokenization'],
      isRequired: true,
      allowMultiple: false
    },
    'Positional Encoding': {
      code: `self.pos_encoding = PositionalEncoding(embed_dim)`,
      description: 'Adds positional information',
      dependencies: ['Embedding'],
      isRequired: true,
      allowMultiple: false
    },
    'Masked Multi-Head Attention': {
      code: `self.attn = nn.MultiheadAttention(embed_dim, num_heads)`,
      description: 'Masked multi-head attention',
      dependencies: ['Positional Encoding'],
      isRequired: true,
      allowMultiple: true
    },
    'FFN': {
      code: `self.ffn = nn.Sequential(nn.Linear(embed_dim, hidden_dim), nn.GELU())`,
      description: 'Feed-forward network with GELU',
      dependencies: ['Masked Multi-Head Attention'],
      isRequired: true,
      allowMultiple: true
    },
    'Layer Normalization': {
      code: `self.layer_norm = nn.LayerNorm(embed_dim)`,
      description: 'Normalizes layer outputs',
      dependencies: ['FFN'],
      isRequired: true,
      allowMultiple: true
    },
    'LM Head': {
      code: `self.lm_head = nn.Linear(hidden_dim, vocab_size)`,
      description: 'Language modeling head',
      dependencies: ['Layer Normalization'],
      isRequired: true,
      allowMultiple: false
    }
  }
};

// Helper function to get available components for a model type
export const getModelComponents = (modelType) => {
  return MODEL_COMPONENTS[modelType] || MODEL_COMPONENTS[MODEL_TYPES.CUSTOM];
};

// Helper function to get component code
export const getComponentCode = (modelType, componentName, params = {}) => {
  const components = getModelComponents(modelType);
  const component = components[componentName];
  if (!component) return `# Unknown component: ${componentName}`;
  return component.code(params);
};

// Helper function to get component dependencies
export const getComponentDependencies = (modelType, componentName) => {
  const components = getModelComponents(modelType);
  return components[componentName]?.dependencies || [];
};

// Helper function to check if component is required
export const isComponentRequired = (modelType, componentName) => {
  const components = getModelComponents(modelType);
  return components[componentName]?.isRequired || false;
};

// Helper function to check if component must be first
export const mustBeFirst = (modelType, componentName) => {
  const components = getModelComponents(modelType);
  return components[componentName]?.mustBeFirst || false;
};

// Helper function to check if component can be added multiple times
export const allowMultiple = (modelType, componentName) => {
  const components = getModelComponents(modelType);
  return components[componentName]?.allowMultiple || false;
};

// Helper function to get component parameters
export const getComponentParameters = (modelType, componentName) => {
  const components = getModelComponents(modelType);
  return components[componentName]?.parameters || [];
};

// Helper function to get component default values
export const getComponentDefaultValues = (modelType, componentName) => {
  const components = getModelComponents(modelType);
  return components[componentName]?.defaultValues || {};
};

// Helper function to get the correct order of components
export const getComponentOrder = (modelType) => {
  return MODEL_COMPONENT_ORDER[modelType] || [];
  };
  