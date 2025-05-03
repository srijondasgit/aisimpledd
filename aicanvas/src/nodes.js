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
      code: (params) => `self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased', vocab_size=${params.vocabSize || 30522})`,
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
      code: (params) => `self.embedding = nn.Embedding(${params.vocabSize || 30522}, ${params.embedDim || 768})`,
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
      code: (params) => `self.pos_encoding = PositionalEncoding(
    d_model=${params.embedDim || 768},
    max_len=${params.maxSeqLen || 512},
    dropout=${params.dropout || 0.1}
)`,
      description: 'Adds positional information',
      dependencies: ['Embedding'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        embedDim: 768,
        maxSeqLen: 512,
        dropout: 0.1
      },
      parameters: [
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 },
        { name: 'maxSeqLen', type: 'number', label: 'Maximum Sequence Length', min: 32, max: 4096 },
        { name: 'dropout', type: 'number', label: 'Dropout Rate', min: 0, max: 1, step: 0.1 }
      ]
    },
    'Multi-Head Attention': {
      code: (params) => `self.attn = nn.MultiheadAttention(
    embed_dim=${params.embedDim || 768},
    num_heads=${params.numHeads || 12},
    dropout=${params.dropout || 0.1},
    batch_first=True
)`,
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
    nn.Linear(${params.embedDim || 768}, ${params.hiddenDim || 3072}),
    nn.GELU(),
    nn.Dropout(${params.dropout || 0.1}),
    nn.Linear(${params.hiddenDim || 3072}, ${params.embedDim || 768})
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
      code: (params) => `self.layer_norm = nn.LayerNorm(
    normalized_shape=${params.embedDim || 768},
    eps=${params.eps || 1e-12}
)`,
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
      code: (params) => `self.lm_head = nn.Linear(${params.hiddenDim || 768}, ${params.vocabSize || 30522})`,
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
      code: (params) => `self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased', vocab_size=${params.vocabSize || 30522})`,
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
      code: (params) => `self.embedding = nn.Embedding(${params.vocabSize || 30522}, ${params.embedDim || 768})`,
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
      code: (params) => `self.pos_encoding = PositionalEncoding(
    d_model=${params.embedDim || 768},
    max_len=${params.maxSeqLen || 512},
    dropout=${params.dropout || 0.1}
)`,
      description: 'Adds positional information',
      dependencies: ['Embedding'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        embedDim: 768,
        maxSeqLen: 512,
        dropout: 0.1
      },
      parameters: [
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 },
        { name: 'maxSeqLen', type: 'number', label: 'Maximum Sequence Length', min: 32, max: 4096 },
        { name: 'dropout', type: 'number', label: 'Dropout Rate', min: 0, max: 1, step: 0.1 }
      ]
    },
    'Performer Attention': {
      code: (params) => `self.attn = PerformerAttention(
    dim=${params.embedDim || 768},
    heads=${params.numHeads || 12},
    dim_head=${params.headDim || 64},
    dropout=${params.dropout || 0.1},
    kernel_type='relu'
)`,
      description: 'Performer attention with kernel approximation',
      dependencies: ['Positional Encoding'],
      isRequired: true,
      allowMultiple: true,
      defaultValues: {
        embedDim: 768,
        numHeads: 12,
        headDim: 64,
        dropout: 0.1
      },
      parameters: [
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 },
        { name: 'numHeads', type: 'number', label: 'Number of Attention Heads', min: 1, max: 64 },
        { name: 'headDim', type: 'number', label: 'Head Dimension', min: 32, max: 128 },
        { name: 'dropout', type: 'number', label: 'Dropout Rate', min: 0, max: 1, step: 0.1 }
      ]
    },
    'FFN': {
      code: (params) => `self.ffn = nn.Sequential(
    nn.Linear(${params.embedDim || 768}, ${params.hiddenDim || 3072}),
    nn.GELU(),
    nn.Dropout(${params.dropout || 0.1}),
    nn.Linear(${params.hiddenDim || 3072}, ${params.embedDim || 768})
)`,
      description: 'Feed-forward network',
      dependencies: ['Performer Attention'],
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
      code: (params) => `self.layer_norm = nn.LayerNorm(
    normalized_shape=${params.embedDim || 768},
    eps=${params.eps || 1e-12}
)`,
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
      code: (params) => `self.lm_head = nn.Linear(${params.hiddenDim || 768}, ${params.vocabSize || 30522})`,
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
  [MODEL_TYPES.BERT]: {
    'Tokenization': {
      code: (params) => `self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased', vocab_size=${params.vocabSize || 30522})`,
      description: 'BERT tokenizer',
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
      code: (params) => `self.embeddings = BertEmbeddings(
    vocab_size=${params.vocabSize || 30522},
    hidden_size=${params.hiddenSize || 768},
    max_position_embeddings=${params.maxSeqLen || 512},
    type_vocab_size=${params.typeVocabSize || 2},
    layer_norm_eps=${params.eps || 1e-12},
    hidden_dropout_prob=${params.dropout || 0.1}
)`,
      description: 'BERT embeddings with token, position, and segment embeddings',
      dependencies: ['Tokenization'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        vocabSize: 30522,
        hiddenSize: 768,
        maxSeqLen: 512,
        typeVocabSize: 2,
        eps: 1e-12,
        dropout: 0.1
      },
      parameters: [
        { name: 'vocabSize', type: 'number', label: 'Vocabulary Size', min: 1000, max: 100000 },
        { name: 'hiddenSize', type: 'number', label: 'Hidden Size', min: 64, max: 4096 },
        { name: 'maxSeqLen', type: 'number', label: 'Maximum Sequence Length', min: 32, max: 4096 },
        { name: 'typeVocabSize', type: 'number', label: 'Type Vocabulary Size', min: 1, max: 10 },
        { name: 'eps', type: 'number', label: 'Epsilon', min: 1e-20, max: 1e-6, step: 1e-12 },
        { name: 'dropout', type: 'number', label: 'Dropout Rate', min: 0, max: 1, step: 0.1 }
      ]
    },
    'Transformer Layer': {
      code: (params) => `self.layer = BertLayer(
    hidden_size=${params.hiddenSize || 768},
    num_attention_heads=${params.numHeads || 12},
    intermediate_size=${params.intermediateSize || 3072},
    hidden_act='gelu',
    hidden_dropout_prob=${params.dropout || 0.1},
    attention_probs_dropout_prob=${params.attnDropout || 0.1},
    layer_norm_eps=${params.eps || 1e-12}
)`,
      description: 'BERT transformer layer',
      dependencies: ['Embedding'],
      isRequired: true,
      allowMultiple: true,
      defaultValues: {
        hiddenSize: 768,
        numHeads: 12,
        intermediateSize: 3072,
        dropout: 0.1,
        attnDropout: 0.1,
        eps: 1e-12
      },
      parameters: [
        { name: 'hiddenSize', type: 'number', label: 'Hidden Size', min: 64, max: 4096 },
        { name: 'numHeads', type: 'number', label: 'Number of Attention Heads', min: 1, max: 64 },
        { name: 'intermediateSize', type: 'number', label: 'Intermediate Size', min: 128, max: 16384 },
        { name: 'dropout', type: 'number', label: 'Dropout Rate', min: 0, max: 1, step: 0.1 },
        { name: 'attnDropout', type: 'number', label: 'Attention Dropout Rate', min: 0, max: 1, step: 0.1 },
        { name: 'eps', type: 'number', label: 'Epsilon', min: 1e-20, max: 1e-6, step: 1e-12 }
      ]
    },
    'Pooler': {
      code: (params) => `self.pooler = BertPooler(
    hidden_size=${params.hiddenSize || 768},
    hidden_act='tanh'
)`,
      description: 'BERT pooler for [CLS] token',
      dependencies: ['Transformer Layer'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        hiddenSize: 768
      },
      parameters: [
        { name: 'hiddenSize', type: 'number', label: 'Hidden Size', min: 64, max: 4096 }
      ]
    },
    'Classification Head': {
      code: (params) => `self.classifier = nn.Linear(${params.hiddenSize || 768}, ${params.numLabels || 2})`,
      description: 'Classification head for downstream tasks',
      dependencies: ['Pooler'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        hiddenSize: 768,
        numLabels: 2
      },
      parameters: [
        { name: 'hiddenSize', type: 'number', label: 'Hidden Size', min: 64, max: 4096 },
        { name: 'numLabels', type: 'number', label: 'Number of Labels', min: 2, max: 1000 }
      ]
    }
  },
  [MODEL_TYPES.GPT]: {
    'Tokenization': {
      code: (params) => `self.tokenizer = GPT2Tokenizer.from_pretrained('gpt2', vocab_size=${params.vocabSize || 50257})`,
      description: 'GPT tokenizer',
      dependencies: [],
      isRequired: true,
      mustBeFirst: true,
      allowMultiple: false,
      defaultValues: {
        vocabSize: 50257
      },
      parameters: [
        { name: 'vocabSize', type: 'number', label: 'Vocabulary Size', min: 1000, max: 100000 }
      ]
    },
    'Embedding': {
      code: (params) => `self.embedding = nn.Embedding(${params.vocabSize || 50257}, ${params.embedDim || 768})`,
      description: 'Token embeddings',
      dependencies: ['Tokenization'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        vocabSize: 50257,
        embedDim: 768
      },
      parameters: [
        { name: 'vocabSize', type: 'number', label: 'Vocabulary Size', min: 1000, max: 100000 },
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 }
      ]
    },
    'Positional Encoding': {
      code: (params) => `self.pos_encoding = PositionalEncoding(
    d_model=${params.embedDim || 768},
    max_len=${params.maxSeqLen || 1024},
    dropout=${params.dropout || 0.1}
)`,
      description: 'Adds positional information',
      dependencies: ['Embedding'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        embedDim: 768,
        maxSeqLen: 1024,
        dropout: 0.1
      },
      parameters: [
        { name: 'embedDim', type: 'number', label: 'Embedding Dimension', min: 64, max: 4096 },
        { name: 'maxSeqLen', type: 'number', label: 'Maximum Sequence Length', min: 32, max: 4096 },
        { name: 'dropout', type: 'number', label: 'Dropout Rate', min: 0, max: 1, step: 0.1 }
      ]
    },
    'Masked Multi-Head Attention': {
      code: (params) => `self.attn = nn.MultiheadAttention(
    embed_dim=${params.embedDim || 768},
    num_heads=${params.numHeads || 12},
    dropout=${params.dropout || 0.1},
    batch_first=True
)`,
      description: 'Masked multi-head attention',
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
    nn.Linear(${params.embedDim || 768}, ${params.hiddenDim || 3072}),
    nn.GELU(),
    nn.Dropout(${params.dropout || 0.1}),
    nn.Linear(${params.hiddenDim || 3072}, ${params.embedDim || 768})
)`,
      description: 'Feed-forward network with GELU',
      dependencies: ['Masked Multi-Head Attention'],
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
    'Layer Normalization': {
      code: (params) => `self.layer_norm = nn.LayerNorm(
    normalized_shape=${params.embedDim || 768},
    eps=${params.eps || 1e-12}
)`,
      description: 'Normalizes layer outputs',
      dependencies: ['FFN'],
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
      code: (params) => `self.lm_head = nn.Linear(${params.hiddenDim || 768}, ${params.vocabSize || 50257})`,
      description: 'Language modeling head',
      dependencies: ['Layer Normalization'],
      isRequired: true,
      allowMultiple: false,
      defaultValues: {
        hiddenDim: 768,
        vocabSize: 50257
      },
      parameters: [
        { name: 'hiddenDim', type: 'number', label: 'Hidden Dimension', min: 64, max: 4096 },
        { name: 'vocabSize', type: 'number', label: 'Vocabulary Size', min: 1000, max: 100000 }
      ]
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
  